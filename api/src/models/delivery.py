from pydantic import BaseModel
from datetime import date


class DeliveryUpdate(BaseModel):
    delivery_date: date
    delivery_status: str
