from pydantic import BaseModel
from typing import Optional
from datetime import date


class DeliveryUpdate(BaseModel):
    delivery_date: date
    delivery_status: Optional[str] = None
    employee_id: Optional[int] = None
