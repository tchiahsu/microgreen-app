from fastapi import APIRouter, HTTPException
from datetime import date
from src.database import connect_db
from src.models.order import OrderData


router = APIRouter(prefix="/orders", tags=["orders"])


# ----------------------------------------
# GET ALL ORDERS FOR THE GIVEN DATE
# ----------------------------------------
@router.get("/{delivery_date}")
async def get_orders(delivery_date: date):
    '''
    Get all order to fulfill for a given delivery date
    Example: GET /orders/2026-01-01
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed")

    try:
        cursor = db.cursor()
        cursor.callproc("get_orders_to_fulfill", (delivery_date, ))
        result = cursor.fetchall()
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to access procedure")
    finally:
        db.close()

    return result


# ----------------------------------------
# ADD A NEW ORDER
# ----------------------------------------
@router.post("/{employee_id}")
async def add_order(employee_id: int, data: OrderData):
    '''
    Add a new order to the system
    Example: POST /orders/
    '''
    db = connect_db()

    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()

        # Get the restaurant ID
        cursor.execute("SELECT get_restaurant_id(%s) AS id",
                       (data.restaurant_name,))
        result = cursor.fetchone()
        if result is None or result["id"] is None:
            raise HTTPException(status_code=400,
                                detail=f"{data.restaurant_name} doesn't exist")
        restaurant_id = result["id"]

        # Get the package ID
        cursor.execute("SELECT get_package_id(%s) AS id", (data.package_type,))
        result = cursor.fetchone()
        if result is None or result["id"] is None:
            raise HTTPException(status_code=500,
                                detail=f"{data.package_type} does not exist")
        package_id = result["id"]

        # Get the product ID
        cursor.execute("SELECT get_product_id(%s, %s) AS id",
                       (data.product_name, package_id))
        result = cursor.fetchone()
        if result is None:
            raise HTTPException(status_code=400,
                                detail=f"{data.product_name} does not exist")
        product_id = result["id"]

        cursor.callproc("add_order", (restaurant_id,
                                      product_id,
                                      data.product_quantity,
                                      data.order_type,
                                      data.end_date,
                                      data.delivery_date,
                                      data.order_status,
                                      employee_id,))

        db.commit()
        cursor.close()
        return {"message": "Order added successfully!"}
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to add order")
    finally:
        db.close()
