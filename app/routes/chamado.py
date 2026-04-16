from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.chamado import (
    criar_chamado,
    listar_chamados_por_cliente,
    listar_todos_chamados,
)
from app.database import get_db
from app.models.user import User
from app.schemas.chamado import ChamadoCreate, ChamadoResponse

router = APIRouter(prefix="/chamados", tags=["Chamados"])


@router.post("/", response_model=ChamadoResponse, status_code=status.HTTP_201_CREATED)
def criar(
    chamado: ChamadoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.tipo_usuario != "cliente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas clientes podem criar chamados",
        )

    return criar_chamado(db, chamado_data=chamado, cliente_id=current_user.id)


@router.get("/", response_model=list[ChamadoResponse])
def listar(
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.tipo_usuario == "admin":
        return listar_todos_chamados(db, limit=limit, offset=offset)

    if current_user.tipo_usuario == "cliente":
        return listar_chamados_por_cliente(
            db,
            cliente_id=current_user.id,
            limit=limit,
            offset=offset,
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Perfil sem permissao para listar chamados",
    )
