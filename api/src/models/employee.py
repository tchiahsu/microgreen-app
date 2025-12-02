from pydantic import BaseModel
from typing import Optional
from datetime import date



class EmployeeData(BaseModel):
    ssn: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class AssignPlanting(BaseModel):
    employee_id: int
    crop_id: int

class AssignDelivery(BaseModel):
    employee_id: int
    delivery_date: date