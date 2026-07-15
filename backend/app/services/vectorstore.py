import re

from openai import OpenAI

from app.config import settings
from app.database import get_connection

client = OpenAI(api_key=settings.openai_api_key)


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    resp = client.embeddings.create(model=settings.openai_embed_model, input=texts)
    return [d.embedding for d in resp.data]


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]


def _vector_literal(embedding: list[float]) -> str:
    """pgvector expects a text literal like '[0.1,0.2,...]'. psycopg3 has no
    built-in adapter for the `vector` type, so we format it ourselves and
    cast explicitly with ::vector in each query rather than pulling in the
    separate pgvector-python package for one conversion."""
    return "[" + ",".join(repr(float(x)) for x in embedding) + "]"


def store_chunks(document_id: str, chunks: list[dict]) -> int:
    """Embeds and inserts chunks. Returns the number stored."""
    if not chunks:
        return 0
    vectors = embed_texts([c["content"] for c in chunks])
    with get_connection() as conn:
        with conn.cursor() as cur:
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                cur.execute(
                    """
                    insert into chunks (document_id, chunk_index, heading, content, embedding)
                    values (%s, %s, %s, %s, %s::vector)
                    """,
                    (document_id, i, chunk.get("heading"), chunk["content"], _vector_literal(vector)),
                )
    return len(chunks)


_WORD_RE = re.compile(r"[a-zA-Z0-9]{4,}")


def _keywords(text: str) -> set[str]:
    return {w.lower() for w in _WORD_RE.findall(text)}


def hybrid_search(query: str, top_k: int) -> list[dict]:
    """Dense vector search over pgvector, re-scored with a light keyword
    overlap boost (a cheap, dependency-free stand-in for full hybrid
    dense+BM25 fusion — enough to sharpen exact-term matches like clause
    numbers without adding another service)."""
    query_vector = embed_query(query)
    query_vector_literal = _vector_literal(query_vector)
    query_words = _keywords(query)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select c.id, c.content, c.heading, c.chunk_index,
                       d.filename, d.id as document_id,
                       1 - (c.embedding <=> %s::vector) as similarity
                from chunks c
                join documents d on d.id = c.document_id
                where d.status = 'ready'
                order by c.embedding <=> %s::vector
                limit %s
                """,
                (query_vector_literal, query_vector_literal, max(top_k * 4, 20)),
            )
            rows = cur.fetchall()

    for row in rows:
        overlap = len(query_words & _keywords(row["content"])) if query_words else 0
        keyword_boost = min(overlap * 0.03, 0.15)
        row["score"] = float(row["similarity"]) + keyword_boost

    rows.sort(key=lambda r: r["score"], reverse=True)
    return rows[:top_k]
