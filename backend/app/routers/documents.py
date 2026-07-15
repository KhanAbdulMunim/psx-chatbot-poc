import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile

from app.database import get_connection
from app.schemas import DocumentOut
from app.services.chunking import chunk_blocks
from app.services.parsing import extract
from app.services.vectorstore import store_chunks

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {"pdf", "docx", "txt"}


@router.get("", response_model=list[DocumentOut])
def list_documents():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("select * from documents order by created_at desc")
            return cur.fetchall()


@router.post("", response_model=DocumentOut)
async def upload_document(file: UploadFile, background_tasks: BackgroundTasks):
    file_type = (file.filename.rsplit(".", 1)[-1] or "").lower()
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(
            400,
            f"Unsupported file type '.{file_type}'. Supported: PDF, DOCX, TXT.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Uploaded file is empty.")

    doc_id = str(uuid.uuid4())
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into documents (id, filename, file_type, status)
                values (%s, %s, %s, 'processing')
                """,
                (doc_id, file.filename, file_type),
            )
            cur.execute("select * from documents where id = %s", (doc_id,))
            doc = cur.fetchone()

    background_tasks.add_task(_process_document, doc_id, file_type, raw)
    return doc


def _process_document(doc_id: str, file_type: str, raw: bytes) -> None:
    try:
        blocks = extract(file_type, raw)
        chunks = chunk_blocks(blocks)
        count = store_chunks(doc_id, chunks)
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "update documents set status = 'ready', chunk_count = %s where id = %s",
                    (count, doc_id),
                )
    except Exception as exc:  # noqa: BLE001 — surface any failure to the admin UI
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "update documents set status = 'failed', error = %s where id = %s",
                    (str(exc)[:500], doc_id),
                )


@router.delete("/{document_id}")
def delete_document(document_id: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("delete from documents where id = %s returning id", (document_id,))
            if cur.fetchone() is None:
                raise HTTPException(404, "Document not found.")
    return {"deleted": document_id}
