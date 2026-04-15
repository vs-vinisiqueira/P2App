import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decodificar_access_token
from app.crud.user import obter_usuario_por_email
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def obter_usuario_autenticado(
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
        if email is None:
            raise credenciais_invalidas
    except jwt.PyJWTError as exc:
        raise credenciais_invalidas from exc

    usuario = obter_usuario_por_email(db, email=email)
    if usuario is None:
        raise credenciais_invalidas

    return usuario
