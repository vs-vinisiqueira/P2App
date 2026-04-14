from pydantic import BaseModel


class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str
    tipo_usuario: str


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    tipo_usuario: str

    class Config:
        from_attributes = True