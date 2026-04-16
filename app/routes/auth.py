from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import criar_access_token, verificar_senha
from app.crud.user import obter_usuario_por_email
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/login",
    response_model=TokenResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/LoginRequest"}
                },
                "application/x-www-form-urlencoded": {
                    "schema": {
                        "type": "object",
                        "required": ["username", "password"],
                        "properties": {
                            "username": {"type": "string", "format": "email"},
                            "password": {"type": "string", "format": "password"},
                        },
                    }
                },
            },
            "required": True,
        }
    },
)
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    try:
        if request.headers.get("content-type", "").startswith(
            "application/x-www-form-urlencoded"
        ):
            form_data = parse_qs((await request.body()).decode())
            credenciais = LoginRequest(
                email=form_data.get("username", form_data.get("email", [""]))[0],
                senha=form_data.get("password", form_data.get("senha", [""]))[0],
            )
        else:
            credenciais = LoginRequest.model_validate(await request.json())
    except (IndexError, UnicodeDecodeError, ValueError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    usuario = obter_usuario_por_email(db, email=credenciais.email)

    if not usuario or not verificar_senha(credenciais.senha, usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = criar_access_token(data={"sub": usuario.email})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
