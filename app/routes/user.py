from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import criar_usuario, listar_usuarios

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse)
def criar(user: UserCreate, db: Session = Depends(get_db)):
    novo_usuario = criar_usuario(db, user)

    if not novo_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    return novo_usuario


@router.get("/", response_model=list[UserResponse])
def listar(db: Session = Depends(get_db)):
    return listar_usuarios(db)