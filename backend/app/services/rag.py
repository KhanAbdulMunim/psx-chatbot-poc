from openai import OpenAI

from app.config import settings
from app.database import get_connection
from app.services.vectorstore import hybrid_search

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are a document Q&A assistant for a proof-of-concept knowledge base.

Rules you must follow exactly:
1. Answer ONLY using the numbered source excerpts provided below. Do not use
   any outside knowledge, even if you are confident it is correct.
2. If the excerpts do not contain enough information to answer the question,
   say clearly that the knowledge base does not contain the answer. Do not
   guess, speculate, or fill gaps with general knowledge.
3. When you state a fact drawn from an excerpt, reference it inline like
   [1], [2] etc., matching the excerpt numbers below.
4. Be concise and direct. Do not pad the answer with disclaimers beyond what
   these rules require.
"""

NO_ANSWER_MESSAGE = (
    "I couldn't find anything in the uploaded documents that answers this "
    "question. Try rephrasing, or upload a document that covers this topic."
)


def _build_context(chunks: list[dict]) -> str:
    parts = []
    for i, c in enumerate(chunks, start=1):
        label = c.get("heading") or "unlabeled section"
        parts.append(f"[{i}] (source: {c['filename']} — {label})\n{c['content']}")
    return "\n\n".join(parts)


def answer_question(question: str) -> dict:
    chunks = hybrid_search(question, settings.retrieval_top_k)
    top_score = chunks[0]["score"] if chunks else 0.0

    if not chunks or top_score < settings.confidence_threshold:
        _log_interaction(question, NO_ANSWER_MESSAGE, was_answered=False, top_score=top_score)
        return {"answer": NO_ANSWER_MESSAGE, "citations": [], "was_answered": False}

    context = _build_context(chunks)
    completion = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Source excerpts:\n\n{context}\n\nQuestion: {question}",
            },
        ],
        temperature=0.1,
    )
    answer_text = completion.choices[0].message.content or NO_ANSWER_MESSAGE

    # Grounding check: only keep citation entries the model actually referenced.
    used_indices = {i for i in range(1, len(chunks) + 1) if f"[{i}]" in answer_text}
    citations = [
        {
            "index": i,
            "filename": chunks[i - 1]["filename"],
            "heading": chunks[i - 1].get("heading"),
            "snippet": chunks[i - 1]["content"][:280],
            "document_id": str(chunks[i - 1]["document_id"]),
        }
        for i in sorted(used_indices)
    ] or [
        # model didn't cite inline — still surface top sources so the answer
        # stays auditable, but this is a signal worth showing in the demo.
        {
            "index": i + 1,
            "filename": c["filename"],
            "heading": c.get("heading"),
            "snippet": c["content"][:280],
            "document_id": str(c["document_id"]),
        }
        for i, c in enumerate(chunks[:2])
    ]

    _log_interaction(question, answer_text, was_answered=True, top_score=top_score)
    return {"answer": answer_text, "citations": citations, "was_answered": True}


def _log_interaction(question: str, answer: str, was_answered: bool, top_score: float) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into interactions (question, answer, was_answered, top_score)
                values (%s, %s, %s, %s)
                """,
                (question, answer, was_answered, top_score),
            )
