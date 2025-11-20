from pydantic import BaseModel
from typing import Optional


class CropData(BaseModel):
    crop_name: str
    seed_type: str
    sow_rate: float
    overnight_soak: bool
    germination_type: str
    days_direct_light: int
    days_indirect_light: int
    rack_grow_days: int
    yield_per_tray: float


class CropUpdate(BaseModel):
    crop_id: int
    crop_name: Optional[str] = None
    seed_type: Optional[str] = None
    sow_rate: Optional[float] = None
    overnight_soak: Optional[bool] = None
    germination_type: Optional[str] = None
    days_direct_light: Optional[int] = None
    days_indirect_light: Optional[int] = None
    rack_grow_days: Optional[int] = None
    yield_per_tray: Optional[float] = None


class CropRatioUpdate(BaseModel):
    crop_ratio: Optional[float] = None