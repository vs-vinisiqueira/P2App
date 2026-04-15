from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import criar_usuario, listar_usuarios

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def criar(user: UserCreate, db: Session = Depends(get_db)):
    novo_usuario = criar_usuario(db, user)

    if not novo_usuario:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )

    return novo_usuario


@router.get("/", response_model=list[UserResponse])
def listar(
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return listar_usuarios(db, limit=limit, offset=offset)
