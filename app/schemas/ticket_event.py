from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

TicketEventType = Literal["comment", "status_changed", "assignment_changed"]
TicketEventMessage = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=1000),
]


class TicketEventCreate(BaseModel):
    message: TicketEventMessage


class TicketEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    actor_id: int
    event_type: TicketEventType
    message: str | None
    old_value: str | None
    new_value: str | None
    created_at: datetime
