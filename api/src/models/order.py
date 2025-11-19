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
