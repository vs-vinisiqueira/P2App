from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.chamado import (
    atualizar_status_chamado,
    criar_chamado,
    listar_chamados_por_cliente,
    listar_todos_chamados,
    obter_chamado_por_id,
)
from app.database import get_db
from app.models.user import User
from app.schemas.chamado import ChamadoCreate, ChamadoResponse, ChamadoStatusUpdate

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


@router.get("/{chamado_id}", response_model=ChamadoResponse)
def obter(
    chamado_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chamado = obter_chamado_por_id(db, chamado_id=chamado_id)
    if chamado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    if current_user.tipo_usuario == "admin":
        return chamado

    if current_user.tipo_usuario == "cliente" and chamado.cliente_id == current_user.id:
        return chamado

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Perfil sem permissao para visualizar este chamado",
    )


@router.patch("/{chamado_id}/status", response_model=ChamadoResponse)
def atualizar_status(
    chamado_id: int,
    dados_status: ChamadoStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.tipo_usuario != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar status de chamados",
        )

    chamado = obter_chamado_por_id(db, chamado_id=chamado_id)
    if chamado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    return atualizar_status_chamado(
        db,
        chamado=chamado,
        novo_status=dados_status.status,
    )
