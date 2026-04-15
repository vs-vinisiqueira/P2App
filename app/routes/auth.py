from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import criar_access_token, verificar_senha
from app.crud.user import obter_usuario_por_email
from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(credenciais: LoginRequest, db: Session = Depends(get_db)):
    usuario = obter_usuario_por_email(db, email=credenciais.email)

    if not usuario or not verificar_senha(credenciais.senha, usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = criar_access_token(data={"sub": usuario.email})
    return TokenResponse(access_token=access_token)
