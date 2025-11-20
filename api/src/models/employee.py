from pydantic import BaseModel
from typing import Optional

class EmployeeData(BaseModel):
    ssn: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None
