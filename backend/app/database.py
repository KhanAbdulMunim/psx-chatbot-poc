import psycopg
from psycopg.rows import dict_row

from app.config import settings


def get_connection():
    """Short-lived connection per request/task. Fine at POC scale."""
    return psycopg.connect(settings.database_url, row_factory=dict_row, autocommit=True)
