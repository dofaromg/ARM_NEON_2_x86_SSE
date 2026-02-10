-- =============================================================================
-- Mrliou Particle System - ClickHouse Schema
-- Database: mrliou_particles
-- =============================================================================

CREATE DATABASE IF NOT EXISTS mrliou_particles;

-- Particle Events (core event log)
CREATE TABLE IF NOT EXISTS mrliou_particles.particle_events (
    event_id UUID DEFAULT generateUUIDv4(),
    particle_id String,
    event_type Enum8(
        'spawn' = 1,
        'transform' = 2,
        'translate' = 3,
        'merge' = 4,
        'decay' = 5,
        'restore' = 6
    ),
    layer Enum8(
        'L0_seed' = 0,
        'L1_gate' = 1,
        'L2_flow' = 2,
        'L3_echo' = 3,
        'L4_world' = 4
    ),
    payload String,               -- JSON payload
    source_module String,          -- originating module
    persona_id Nullable(String),   -- EchoPersona reference
    signature Nullable(String),    -- GPG signature
    created_at DateTime64(3) DEFAULT now64(3)
) ENGINE = MergeTree()
ORDER BY (created_at, particle_id)
PARTITION BY toYYYYMM(created_at);

-- Seed Corpus Registry (Mr.liou.1B.SeedCorpus tracking)
CREATE TABLE IF NOT EXISTS mrliou_particles.seed_corpus (
    seed_id UUID DEFAULT generateUUIDv4(),
    corpus_name String,
    corpus_version String,
    particle_count UInt64,
    checksum String,               -- SHA-256
    origin_signature String,       -- GPG signed origin
    metadata String,               -- JSON metadata
    imported_at DateTime64(3) DEFAULT now64(3)
) ENGINE = MergeTree()
ORDER BY (imported_at, corpus_name);

-- Persona Sync State (EchoPersona state tracking)
CREATE TABLE IF NOT EXISTS mrliou_particles.persona_sync_state (
    persona_id String,
    sync_version UInt64,
    state_hash String,
    translation_map String,        -- JSON: NEON->SSE mapping state
    last_sync DateTime64(3) DEFAULT now64(3)
) ENGINE = ReplacingMergeTree(sync_version)
ORDER BY persona_id;

-- MCP Session Log
CREATE TABLE IF NOT EXISTS mrliou_particles.mcp_sessions (
    session_id UUID DEFAULT generateUUIDv4(),
    client_id String,
    transport Enum8('stdio' = 1, 'streamable_http' = 2),
    tools_invoked Array(String),
    token_count UInt32,
    started_at DateTime64(3),
    ended_at Nullable(DateTime64(3)),
    status Enum8('active' = 1, 'completed' = 2, 'error' = 3)
) ENGINE = MergeTree()
ORDER BY (started_at, session_id);

-- Fluin Particle Dictionary (反推映射)
CREATE TABLE IF NOT EXISTS mrliou_particles.fluin_dictionary (
    entry_id UUID DEFAULT generateUUIDv4(),
    particle_key String,
    neon_intrinsic String,         -- ARM NEON function name
    sse_intrinsic String,          -- x86 SSE equivalent
    reverse_map String,            -- 反推映射 JSON
    confidence Float32,
    generation UInt32,
    created_at DateTime64(3) DEFAULT now64(3)
) ENGINE = MergeTree()
ORDER BY (particle_key, generation);
