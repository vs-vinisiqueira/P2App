from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

ChamadoPrioridade = Literal["baixa", "media", "alta"]
ChamadoStatus = Literal["aberto", "em_andamento", "concluido", "cancelado"]
TituloChamado = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=150),
]
DescricaoChamado = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class ChamadoCreate(BaseModel):
    titulo: TituloChamado
    descricao: DescricaoChamado
    prioridade: ChamadoPrioridade


class ChamadoStatusUpdate(BaseModel):
    status: ChamadoStatus


class ChamadoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descricao: str
    status: ChamadoStatus
    prioridade: ChamadoPrioridade
    cliente_id: int
    created_at: datetime
