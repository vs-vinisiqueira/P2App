from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChamadoCreate(BaseModel):
    titulo: str = Field(min_length=2, max_length=150)
    descricao: str = Field(min_length=1)
    prioridade: Literal["baixa", "media", "alta"]


class ChamadoStatusUpdate(BaseModel):
    status: Literal["aberto", "em_andamento", "concluido", "cancelado"]


class ChamadoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descricao: str
    status: str
    prioridade: str
    cliente_id: int
    created_at: datetime
