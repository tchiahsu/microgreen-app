from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from src.database import connect_db
from typing import Any, Dict, List
from src.models.order import OrderData, UpdateOrderProduct
from src.auth import get_current_employee_id


router = APIRouter(prefix="/orders", tags=["orders"])


def group_by_restaurant(data: List[Dict[str, Any]]):
    '''
    Groups orders by restaurants name and collects
    the necessary fields.
    '''
    result: Dict[str, List[Dict[str, Any]]] = {}

    for order in data:
        restaurant = order["restaurant_name"]
        if restaurant not in result:
            result[restaurant] = []

        result[restaurant].append({
            "order_id": order["order_id"],
            "restaurant_id": order["restaurant_id"],
            "product_id": order["product_id"],
            "product_name": order["product_name"],
            "package_type": order["package_type"],
            "quantity": order["quantity"],
            "order_status": order["order_status"],
            "employee_id": order["employee_id"],
            "delivery_date": order["delivery_date"],
            "is_forced": order["is_forced"]
        })

    return result


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
        result = list(cursor.fetchall())
        cursor.close()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to access procedure")
    finally:
        db.close()

    return group_by_restaurant(result)


# ----------------------------------------
# ADD A NEW ORDER
# ----------------------------------------
@router.post("/")
async def add_order(data: OrderData,
                    employee_id: int = Depends(get_current_employee_id)):
    '''
    Add a new order to the system
    Example: POST /orders/
    '''
    print("DEBUG add_order reached with:", data, "employee_id:", employee_id)
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


# ----------------------------------------
# UPDATE A PRODUCT FROM AN ORDER
# ----------------------------------------
@router.put("/{order_id}/update_product/{product_id}")
async def update_order_product(order_id: int, product_id: int,
                               data: UpdateOrderProduct):
    '''
    Updates a product inside an order
    Example: PUT /update_product/111
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Connection to database failed.")
    cursor = db.cursor()

    try:
        cursor.callproc("update_order", (order_id,
                                         data.order_status,
                                         data.employee_id,
                                         data.delivery_date,
                                         product_id,
                                         data.quantity,
                                         data.apply_to_future,))
        db.commit()
        cursor.close()
        return {"message": "Order updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail=str(e))
    finally:
        db.close()


# ----------------------------------------
# DELETE A PRODUCT FROM AN ORDER
# ----------------------------------------
@router.delete("/{order_id}/delete_product/{product_id}")
async def delete_product_from_order(order_id: int, product_id: int):
    '''
    Delete a product from an order
    Example: DELETE /orders/34/delete_product/111
    '''
    db = connect_db()
    if db is None:
        raise HTTPException(status_code=500,
                            detail="Database connection failed")

    try:
        cursor = db.cursor()
        # Get the product ID
        cursor.callproc("delete_order_product", (order_id, product_id))
        db.commit()
        cursor.close()
        return {"message": "Product deleted successfully!"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400,
                            detail="Unable to delete product")
    finally:
        db.close()
