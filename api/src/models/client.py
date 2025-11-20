from pydantic import BaseModel
from typing import Optional


class ClientAdd(BaseModel):
    restaurant_name: str
    street_num: int
    street_name: str
    city: str
    state: str
    zip_code: str


class ContactInfoAdd(BaseModel):
    restaurant_id: int
    email: str
    first_name: str
    last_name: str
    phone: str


class ContactInfoUpdate(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    restaurant_id: Optional[int] = None


class ContactInfoDelete(BaseModel):
    email: str
