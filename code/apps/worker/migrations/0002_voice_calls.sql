-- 0002_voice_calls.sql — Voice fallback system
CREATE TABLE IF NOT EXISTS voice_calls (
    id TEXT PRIMARY KEY,
    lead_dedup_key TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    exotel_call_sid TEXT,
    buyer_phone TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued','dialling','answered','connected','skipped',
                          'no_answer','busy','failed','cancelled')),
    attempts INTEGER NOT NULL DEFAULT 0,
    duration_sec INTEGER DEFAULT 0,
    dtmf_response TEXT,
    tts_text TEXT,
    recording_url TEXT,
    triggered_at_ms INTEGER NOT NULL,
    answered_at_ms INTEGER,
    ended_at_ms INTEGER,
    created_at_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_voice_seller_time ON voice_calls (seller_id, triggered_at_ms);
CREATE INDEX IF NOT EXISTS idx_voice_lead ON voice_calls (lead_dedup_key);
CREATE INDEX IF NOT EXISTS idx_voice_status ON voice_calls (status);
