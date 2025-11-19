from pydantic import BaseModel

class AddProduct(BaseModel):
    product_name: str
    weight_grams: int
    is_active: bool
    package_id: int
