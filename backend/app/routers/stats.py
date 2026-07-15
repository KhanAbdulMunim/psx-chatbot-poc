from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.database import get_connection

router = APIRouter(tags=["stats"])


@router.get("/stats")
def get_stats():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("select count(*) as n from documents where status = 'ready'")
            docs_ready = cur.fetchone()["n"]
            cur.execute("select count(*) as n from documents")
            docs_total = cur.fetchone()["n"]
            cur.execute("select count(*) as n from chunks")
            chunk_count = cur.fetchone()["n"]
            cur.execute("select count(*) as n from interactions")
            questions_total = cur.fetchone()["n"]
            cur.execute("select count(*) as n from interactions where was_answered = false")
            questions_unanswered = cur.fetchone()["n"]
    return {
        "documents_ready": docs_ready,
        "documents_total": docs_total,
        "chunk_count": chunk_count,
        "questions_total": questions_total,
        "questions_unanswered": questions_unanswered,
    }


class LoginRequest(BaseModel):
    password: str


@router.post("/admin/login")
def admin_login(req: LoginRequest):
    if req.password != settings.admin_password:
        raise HTTPException(401, "Incorrect password.")
    return {"ok": True}
