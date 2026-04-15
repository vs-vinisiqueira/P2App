from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)
    tipo_usuario: Literal["admin", "tecnico", "cliente"]

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, email: str) -> str:
        return email.lower()


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    tipo_usuario: str

    class Config:
        from_attributes = True
