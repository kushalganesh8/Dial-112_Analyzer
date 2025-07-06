from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLoginRequest(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: int

    class Config:
        orm_mode = True
