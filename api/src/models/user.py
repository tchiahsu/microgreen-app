from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    employee_id: int


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class LinkEmployeeToUser(BaseModel):
    employee_id: int
    user_id: int
