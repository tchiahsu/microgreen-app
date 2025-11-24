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
    order_status: str | None = None
    employee_id: int | None = None
    delivery_date: date | None = None
    product_id: int | None = None
    quantity: int | None = None
    apply_to_future: bool = False
