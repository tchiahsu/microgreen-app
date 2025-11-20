from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.client import ClientAdd, ContactInfoAdd, ContactInfoUpdate

router = APIRouter(prefix="/clients", tags=["clients"])


# ----------------------------------------
# GET ALL RESTAURANT DATA
# ----------------------------------------
@router.get("/restaurant_information")
async def get_restaurant_information():
    '''
    Get the restaurant information
    Example: GET /clients/restaurant_information
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_all_restaurant_names")
        result = cursor.fetchall()

        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to get restaurant information")
    finally:
        db.close()

    return result


# ----------------------------------------
# ADD NEW RESTAURANT
# ----------------------------------------
@router.post("/")
async def add_new_restaurant(data: ClientAdd):
    '''
    Add new restaurant into the system
    Example: POST /clients/
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()

        cursor.callproc("add_client", (data.restaurant_name,
                                       data.street_num,
                                       data.street_name,
                                       data.city,
                                       data.state,
                                       data.zip_code,))

        db.commit()
        cursor.close()
        return {"message": "Client added successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to add client")
    finally:
        db.close()


# ----------------------------------------
# ADD NEW CONTACT INFORMATION
# ----------------------------------------
@router.post("/contact_info")
async def add_new_contact_info(data: ContactInfoAdd):
    '''
    Add new contact information into the system
    Example: POST /clients/contact_info
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()

        cursor.callproc("add_contact_info", (data.restaurant_id,
                                             data.email,
                                             data.first_name,
                                             data.last_name,
                                             data.phone,))

        db.commit()
        cursor.close()
        return {"message": "Client added successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to add contact information")
    finally:
        db.close()


# ----------------------------------------
# DELETE RESTAURANT CONTACT INFORMATION
# ----------------------------------------
@router.delete("/contact_info")
async def delete_contact_info(data: ContactInfoDelete):
    '''
    Delete a contact information from the system
    Example: DELETE clients/contact_info
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("delete_contact_info", (data.email,))
        db.commit()
        cursor.close()
        return {"message": "Contact Info deleted successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to delete contact information")
    finally:
        db.close()


# ----------------------------------------
# EDIT CONTACT INFORMATION
# ----------------------------------------
@router.put("/contact_info")
async def edit_contact_info(data: ContactInfoUpdate):
    '''
    Edits the contact information
    Example: PUT clients/contact_info
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("update_contact_info", (data.email,
                                                data.first_name,
                                                data.last_name,
                                                data.phone,
                                                data.restaurant_id))

        db.commit()
        cursor.close()
        return {"message": "Order added successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update contact information")
    finally:
        db.close()
