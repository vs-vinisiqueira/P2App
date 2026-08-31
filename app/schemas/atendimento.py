from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.schemas.user import UserResponse

AtendimentoStatus = Literal["planejado", "em_andamento", "concluido", "cancelado"]

AtendimentoDescricao = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2),
]


class AtendimentoCreate(BaseModel):
    descricao: AtendimentoDescricao
    status: AtendimentoStatus = "em_andamento"
    data_inicio: datetime | None = None


class AtendimentoUpdate(BaseModel):
    descricao: AtendimentoDescricao | None = None
    status: AtendimentoStatus | None = None
    data_fim: datetime | None = None


class AtendimentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    tecnico_id: int
    descricao: str
    status: AtendimentoStatus
    data_inicio: datetime
    data_fim: datetime | None
    created_at: datetime
    updated_at: datetime
    tecnico: UserResponse | None = None
