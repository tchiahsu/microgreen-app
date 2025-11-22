from pydantic import BaseModel
from datetime import date


class OrderData(BaseModel):
    restaurant_name: str
    product_name: str
    package_type: str
    product_quantity: int
    order_type: str
    end_date: date
    delivery_date: date
    order_status: str


class UpdateOrderProduct(BaseModel):
    order_id: int
    order_type: str
    employee_id: int
    delivery_date: date
    product_id: int
    quantity: int
    apply_to_future: bool
