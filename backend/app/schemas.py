from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

TicketStatus = Literal["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "TODO", "DONE"]
TicketPriority = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    priority: TicketPriority = "MEDIUM"
    status: TicketStatus = "OPEN"
    assignee: str = "Sai Charan"

class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    priority: TicketPriority | None = None
    status: TicketStatus | None = None
    assignee: str | None = None

class TicketOut(TicketCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TicketStatsOut(BaseModel):
    total: int
    open: int = 0
    inProgress: int = 0
    resolved: int = 0
    # Backward compatibility attributes:
    todo: int = 0
    done: int = 0

# Backward compatibility aliases
TaskCreate = TicketCreate
TaskUpdate = TicketUpdate
TaskOut = TicketOut
StatsOut = TicketStatsOut
