from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.delivery import DeliveryUpdate

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


# ----------------------------------------
# GET ALL THE DELIVERY DATES
# ----------------------------------------
@router.get("/")
async def get_delivery_info():
    '''
    Gets all delivery information
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM delivery")
        result = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update delivery information")
    finally:
        db.close()

    return result


# ----------------------------------------
# UPDATE DELIVERY INFORMATION
# ----------------------------------------
@router.put("/")
async def update_delivery_info(data: DeliveryUpdate):
    '''
    Update the delivery information
    Example" PUT /deliveries/
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("update_delivery", (data.delivery_date,
                                            data.delivery_status,
                                            data.employee_id))
        db.commit()
        cursor.close()
        return {"message": "Delivery updated successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update delivery information")
    finally:
        db.close()
