from pydantic import BaseModel
from typing import Optional, List


class SingleComposition(BaseModel):
    crop_id: int
    crop_ratio: float


class CompositionItem(BaseModel):
    crop_id: int
    crop_ratio: float


class AddProduct(BaseModel):
    product_name: str
    weight_grams: Optional[int] = None
    is_active: bool
    package_id: int
    list_of_composition: List[CompositionItem]


class UpdateProduct(BaseModel):
    product_name: Optional[str] = None
    weight_grams: Optional[int] = None
    is_active: Optional[bool] = None
    package_id: Optional[int] = None


class ProductSize(BaseModel):
    product_name: str
    package_id: int
    weight_grams: Optional[float]
    is_active: bool


class UpdateComposition(BaseModel):
    product_name: str
    list_of_composition: List[CompositionItem]
