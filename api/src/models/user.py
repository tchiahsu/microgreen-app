from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    employee_id: int


class LoginUser(BaseModel):
    email: EmailStr
    password: str
