from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

from .config import settings
from .db import Base, engine, get_db
from .models import Ticket, Task
from .schemas import (
    TicketCreate, TicketOut, TicketUpdate, TicketStatsOut,
    TaskCreate, TaskOut, TaskUpdate, StatsOut
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production containers run Alembic before Uvicorn; create_all keeps tests self-contained.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/")
def root():
    return {"service": settings.app_name, "version": "1.0.0", "docs": "/docs", "domain": "IT Service & Helpdesk"}

@app.get("/health")
def health():
    return {"status": "UP"}

@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    db.execute(select(func.count(Ticket.id)))
    return {"status": "READY"}

# ==========================================
# PRIMARY DOMAIN ENDPOINTS: /api/tickets
# ==========================================

@app.get("/api/tickets", response_model=list[TicketOut])
def list_tickets(db: Session = Depends(get_db)):
    return list(db.scalars(select(Ticket).order_by(Ticket.id.desc())))

@app.get("/api/tickets/stats", response_model=TicketStatsOut)
def ticket_stats(db: Session = Depends(get_db)):
    rows = db.execute(select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)).all()
    counts = {status: count for status, count in rows}
    total = sum(counts.values())
    open_count = counts.get("OPEN", 0) + counts.get("TODO", 0)
    in_prog = counts.get("IN_PROGRESS", 0)
    resolved = counts.get("RESOLVED", 0) + counts.get("DONE", 0)
    return TicketStatsOut(
        total=total,
        open=open_count,
        inProgress=in_prog,
        resolved=resolved,
        todo=open_count,
        done=resolved
    )

@app.get("/api/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.post("/api/tickets", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.put("/api/tickets/{ticket_id}", response_model=TicketOut)
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, key, value)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.delete("/api/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()

# ==========================================
# BACKWARD COMPATIBILITY ALIASES: /api/tasks
# ==========================================

@app.get("/api/tasks", response_model=list[TicketOut])
def list_tasks_alias(db: Session = Depends(get_db)):
    return list_tickets(db)

@app.get("/api/tasks/stats", response_model=TicketStatsOut)
def task_stats_alias(db: Session = Depends(get_db)):
    return ticket_stats(db)

@app.get("/api/tasks/{task_id}", response_model=TicketOut)
def get_task_alias(task_id: int, db: Session = Depends(get_db)):
    return get_ticket(task_id, db)

@app.post("/api/tasks", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_task_alias(payload: TicketCreate, db: Session = Depends(get_db)):
    return create_ticket(payload, db)

@app.put("/api/tasks/{task_id}", response_model=TicketOut)
def update_task_alias(task_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    return update_ticket(task_id, payload, db)

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_alias(task_id: int, db: Session = Depends(get_db)):
    return delete_ticket(task_id, db)
