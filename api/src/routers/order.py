from fastapi import APIRouter, HTTPException
from database import connect_db

router = APIRouter(prefix="/crops", tags=["Crops"])


# ----------------------------------------
# GET ALL ORDERS FOR THE GIVEN DATE
# ----------------------------------------
@router.get("/order/{user}/{delivery_date}")
async def get_orders(delivery_date: ):
    '''
    Get all order to fulfill for a given delivery date
    Example: GET /orders/10/?delivery_date=2026-12-23
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("get_orders_to_fulfill_today", (delivery_date,))
        result = cursor.fetchall()
        cursor.close()
    finally:
        db.close()

    return result
