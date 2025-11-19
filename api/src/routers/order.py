from fastapi import APIRouter, HTTPException
from datetime import date
from src.database import connect_db

router = APIRouter(prefix="/orders", tags=["Orders"])


# ----------------------------------------
# GET ALL ORDERS FOR THE GIVEN DATE
# ----------------------------------------
@router.get("/{delivery_date}")
def get_orders(delivery_date: date):
    '''
    Get all order to fulfill for a given delivery date
    Example: GET /orders/2026-01-01
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("get_orders_to_fulfill_today", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to access Procedure")
    finally:
        db.close()

    return result
