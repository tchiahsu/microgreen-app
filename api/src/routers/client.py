from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.client import (ClientAdd, ContactInfoAdd, ContactInfoUpdate,
                               RestaurantInfoUpdate, ContactInfoDelete)

router = APIRouter(prefix="/clients", tags=["clients"])


# ----------------------------------------
# GET RESTAURANT NAMES
# ----------------------------------------
@router.get("/restaurant_names")
async def get_restaurant_names():
    '''
    Get the restaurant information
    Example: GET /clients/restaurant_names
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


# ------------------------------------------
# GET ALL RESTAURANTS INFO AND CONTACT INFO
# ------------------------------------------
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
        cursor.callproc("get_all_restaurant_contact_info")
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

        cursor.execute("SELECT get_restaurant_id(%s) AS id",
                       (data.restaurant_name,))
        result = cursor.fetchone()

        if not result or result["id"] is None:
            raise HTTPException(status_code=400,
                                detail="Unable to retrieve restaurant id.")

        cursor.close()
        return {"message": "Client added successfully!",
                "restaurant_id": result["id"]}
    except Exception as e:
        db.rollback()
        print("client error: ", e)
        raise HTTPException(status_code=400,
                            detail=str(e))
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
        cursor.callproc("delete_contact_info", (data.contact_id, ))
        db.commit()

        cursor.close()
        return {"message": "Contact info deleted successfully!"}
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
        cursor.callproc("update_contact_info", (data.contact_id,
                                                data.restaurant_id,
                                                data.email,
                                                data.first_name,
                                                data.last_name,
                                                data.phone))
        db.commit()
        cursor.close()
        return {"message": "Contact Information was successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update contact information")
    finally:
        db.close()


# ----------------------------------------
# EDIT RESTAURANT INFORMATION
# ----------------------------------------
@router.put("/restaurant_info")
async def edit_restaurant_info(data: RestaurantInfoUpdate):
    '''
    Edits the contact information
    Example: PUT clients/restaurant_info
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("update_restaurant_info", (data.restaurant_id,
                                                   data.restaurant_name,
                                                   data.street_num,
                                                   data.street_name,
                                                   data.city,
                                                   data.state,
                                                   data.zip_code,
                                                   data.is_active))
        db.commit()
        cursor.close()
        return {"message": "Restaurant information was updated successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update restaurant information")
    finally:
        db.close()
