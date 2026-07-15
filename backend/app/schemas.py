from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    error: str | None = None
    chunk_count: int
    created_at: datetime


class ChatRequest(BaseModel):
    question: str


class Citation(BaseModel):
    index: int
    filename: str
    heading: str | None
    snippet: str
    document_id: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    was_answered: bool
