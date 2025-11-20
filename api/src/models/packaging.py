from pydantic import BaseModel


class PackagingData(BaseModel):
    size_type: str
