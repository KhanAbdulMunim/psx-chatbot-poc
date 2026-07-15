"""Turns (text, heading) blocks from parsing.py into fixed-size, overlapping
chunks suitable for embedding. Chunking respects heading boundaries where
they exist, so a chunk never silently spans two unrelated sections.

Uses word-count windowing rather than a tokenizer: it avoids a fragile
first-use network fetch (tiktoken's BPE file download, which some networks
block) and is precise enough for chunk sizing at POC scale — ~260 words
tracks closely with the ~350-token target this app is tuned around.
"""

CHUNK_WORDS = 260
OVERLAP_WORDS = 45


def chunk_blocks(blocks: list[tuple[str, str | None]]) -> list[dict]:
    """Returns a list of {content, heading} dicts, in document order."""
    chunks: list[dict] = []
    for text, heading in blocks:
        words = text.split()
        if not words:
            continue
        if len(words) <= CHUNK_WORDS:
            chunks.append({"content": text.strip(), "heading": heading})
            continue

        start = 0
        while start < len(words):
            end = min(start + CHUNK_WORDS, len(words))
            piece = " ".join(words[start:end]).strip()
            if piece:
                chunks.append({"content": piece, "heading": heading})
            if end == len(words):
                break
            start = end - OVERLAP_WORDS
    return chunks
