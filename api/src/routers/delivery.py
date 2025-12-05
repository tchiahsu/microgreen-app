from fastapi import APIRouter, HTTPException
from src.database import connect_db
from src.models.delivery import DeliveryUpdate
from datetime import date

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


# ----------------------------------------
# GET ALL THE DELIVERY DATES
# ----------------------------------------
@router.get("/")
async def get_delivery_info():
    '''
    Gets all delivery information
    Example: GET /deliveries/
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")

    try:
        cursor = db.cursor()
        cursor.callproc("get_delivery_info")
        result = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to fetch delivery information")
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
                                            data.delivery_status))
        db.commit()
        cursor.close()
        return {"message": "Delivery updated successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to update delivery information")
    finally:
        db.close()


# ----------------------------------------
# ADD DELIVERY DATE
# ----------------------------------------
@router.post("/{delivery_date}")
async def add_delivery_date(delivery_date: date):
    '''
    Add a new delivery date to the system
    Example POST /deliveries/2025-01-01
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("add_delivery_date", (delivery_date,))
        db.commit()
        cursor.close()
        return {"message": "Delivery added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail=str(e))
    finally:
        db.close()
