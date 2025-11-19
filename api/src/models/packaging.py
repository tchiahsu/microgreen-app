from pydantic import BaseModel


class UpdatePackaging(BaseModel):
    size_type: str
