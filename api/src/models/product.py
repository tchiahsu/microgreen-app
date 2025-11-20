from pydantic import BaseModel
from typing import Optional


class AddProduct(BaseModel):
    product_name: str
    weight_grams: int
    is_active: bool
    package_id: int


class UpdateProduct(BaseModel):
    product_name: Optional[str] = None
    weight_grams: Optional[int] = None
    is_active: Optional[bool] = None
    package_id: Optional[int] = None
