-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Enables pgvector and creates the two tables the POC needs.

create extension if not exists vector;

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    filename text not null,
    file_type text not null,              -- pdf | txt | docx
    status text not null default 'processing', -- processing | ready | failed
    error text,
    chunk_count int not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists chunks (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    chunk_index int not null,
    heading text,                          -- nearest detected section/heading, if any
    content text not null,
    embedding vector(1536) not null,       -- text-embedding-3-small dimension
    created_at timestamptz not null default now()
);

create index if not exists chunks_embedding_idx
    on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists chunks_document_id_idx on chunks (document_id);

create table if not exists interactions (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    was_answered boolean not null,
    top_score float,
    created_at timestamptz not null default now()
);
