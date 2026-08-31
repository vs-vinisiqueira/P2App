import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.authorization import is_admin, is_support_staff
from app.core.security import decodificar_access_token
from app.crud.user import obter_usuario_por_email
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nao foi possivel validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decodificar_access_token(token)
        email = payload.get("sub")
        if not email:
            raise credenciais_invalidas
    except jwt.PyJWTError as exc:
        raise credenciais_invalidas from exc

    usuario = obter_usuario_por_email(db, email=email)
    if usuario is None:
        raise credenciais_invalidas

    return usuario


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para administradores",
        )

    return current_user


def require_support_staff(
    current_user: User = Depends(get_current_user),
) -> User:
    if not is_support_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para administradores ou suporte",
        )

    return current_user
