from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)
    tipo_usuario: Literal["admin", "gerente", "tecnico", "cliente"]

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, email: str) -> str:
        return email.lower()


class UserPublicCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)
    tipo_usuario: str | None = None

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, email: str) -> str:
        return email.lower()

    @field_validator("tipo_usuario")
    @classmethod
    def validar_tipo_usuario_publico(cls, tipo_usuario: str | None) -> str | None:
        if tipo_usuario is None or tipo_usuario == "cliente":
            return tipo_usuario

        raise ValueError("Cadastro publico permite apenas usuarios do tipo cliente")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    tipo_usuario: str
    role: str
