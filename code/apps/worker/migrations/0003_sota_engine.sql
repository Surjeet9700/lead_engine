-- 0003_sota_engine.sql — SOTA Engine: Spec Extractions, Voice Sessions, Disputes & WhatsApp Interactive State
-- D1-safe: INTEGER epoch-ms timestamps, INTEGER 0/1 booleans

CREATE TABLE IF NOT EXISTS pump_spec_extractions (
	id TEXT PRIMARY KEY,
	lead_dedup_key TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	power_hp REAL,
	head_meters REAL,
	flow_lpm REAL,
	pump_type TEXT,
	phase TEXT,
	voltage REAL,
	commercial_intent_score INTEGER NOT NULL DEFAULT 50,
	extracted_sku TEXT,
	confidence REAL NOT NULL DEFAULT 1.0,
	raw_summary TEXT,
	created_at_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_spec_lead ON pump_spec_extractions (lead_dedup_key);
CREATE INDEX IF NOT EXISTS idx_spec_seller ON pump_spec_extractions (seller_id, created_at_ms);

CREATE TABLE IF NOT EXISTS voice_sessions (
	id TEXT PRIMARY KEY,
	lead_dedup_key TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	mode TEXT NOT NULL DEFAULT 'telephony_bridge' CHECK (mode IN ('telephony_bridge', 'conversational_agent')),
	caller_phone TEXT NOT NULL,
	recipient_phone TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer')),
	duration_sec INTEGER NOT NULL DEFAULT 0,
	dtmf_key TEXT,
	transcript TEXT,
	summary TEXT,
	recording_url TEXT,
	telephony_provider TEXT NOT NULL DEFAULT 'exotel',
	tts_engine TEXT NOT NULL DEFAULT 'sarvam_bulbul',
	stt_engine TEXT,
	created_at_ms INTEGER NOT NULL DEFAULT 0,
	ended_at_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_voice_session_seller ON voice_sessions (seller_id, created_at_ms);
CREATE INDEX IF NOT EXISTS idx_voice_session_lead ON voice_sessions (lead_dedup_key);

CREATE TABLE IF NOT EXISTS buylead_disputes (
	id TEXT PRIMARY KEY,
	lead_dedup_key TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	lead_id TEXT NOT NULL,
	buyer_name TEXT,
	buyer_mobile TEXT,
	dispute_reason TEXT NOT NULL CHECK (dispute_reason IN ('academic_project', 'invalid_phone', 'fake_inquiry', 'category_mismatch', 'outside_service_area')),
	credit_value_inr INTEGER NOT NULL DEFAULT 350,
	status TEXT NOT NULL DEFAULT 'drafted' CHECK (status IN ('drafted', 'submitted', 'under_review', 'approved_refunded', 'rejected')),
	im_ticket_id TEXT,
	evidence_payload TEXT NOT NULL DEFAULT '{}',
	created_at_ms INTEGER NOT NULL DEFAULT 0,
	resolved_at_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_dispute_seller ON buylead_disputes (seller_id, created_at_ms);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON buylead_disputes (status);

CREATE TABLE IF NOT EXISTS wa_interactive_sessions (
	id TEXT PRIMARY KEY,
	lead_dedup_key TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	buyer_phone TEXT NOT NULL,
	last_action TEXT,
	selected_button_id TEXT,
	selected_list_item_id TEXT,
	state TEXT NOT NULL DEFAULT 'quote_sent' CHECK (state IN ('quote_sent', 'spec_confirmed', 'call_requested', 'pdf_delivered', 'closed')),
	created_at_ms INTEGER NOT NULL DEFAULT 0,
	updated_at_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_wa_session_phone ON wa_interactive_sessions (buyer_phone);
CREATE INDEX IF NOT EXISTS idx_wa_session_lead ON wa_interactive_sessions (lead_dedup_key);
