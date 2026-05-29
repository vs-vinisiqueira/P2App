from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

TicketStatus = Literal["open", "in_progress", "resolved", "closed"]
TicketPriority = Literal["low", "medium", "high", "critical"]

TicketTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=150),
]
TicketDescription = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]
TicketCategory = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=80),
]


class TicketCreate(BaseModel):
    title: TicketTitle
    description: TicketDescription
    priority: TicketPriority = "medium"
    category: TicketCategory | None = None
    assigned_to_id: int | None = Field(default=None, gt=0)


class TicketUpdate(BaseModel):
    title: TicketTitle | None = None
    description: TicketDescription | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    category: TicketCategory | None = None
    assigned_to_id: int | None = Field(default=None, gt=0)


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    category: str | None
    owner_id: int
    assigned_to_id: int | None
    created_at: datetime
    updated_at: datetime


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    limit: int
    offset: int
