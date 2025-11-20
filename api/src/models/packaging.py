from pydantic import BaseModel

class UpdatePackaging(BaseModel):
    size_type: str


class AddPackaging(BaseModel):
    size_type: str