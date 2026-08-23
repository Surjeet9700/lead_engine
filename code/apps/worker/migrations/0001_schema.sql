-- 0001_schema.sql — additive-only initial schema
-- D1-safe: INTEGER epoch-ms timestamps, INTEGER 0/1 booleans, no PRAGMA

CREATE TABLE IF NOT EXISTS sellers (
	id TEXT PRIMARY KEY,
	company TEXT NOT NULL,
	owner_name TEXT NOT NULL,
	owner_wa_phone TEXT NOT NULL,
	im_webhook_token TEXT NOT NULL,
	glusr_crm_key TEXT,
	wa_phone_id TEXT,
	gmail_refresh_token TEXT,
	catalog_json TEXT NOT NULL DEFAULT '{}',
	status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding','active','paused','churned')),
	created_at_ms INTEGER NOT NULL,
	updated_at_ms INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sellers_im_webhook_token_uq ON sellers (im_webhook_token);

CREATE TABLE IF NOT EXISTS lead_states (
	dedup_key TEXT PRIMARY KEY,
	fuzzy_key TEXT,
	lead_id TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	source TEXT NOT NULL DEFAULT 'push' CHECK (source IN ('push','gmail','pull')),
	route TEXT NOT NULL DEFAULT 'pending' CHECK (route IN ('pending','wa_now','wa_defer_digest','human','silent_spam')),
	outcome TEXT NOT NULL DEFAULT 'received' CHECK (outcome IN ('received','sent','delivered','read','replied','deferred','spam_skipped','failed_permanent','retrying','dead_lettered')),
	attempts INTEGER NOT NULL DEFAULT 0,
	sla_due_at_ms INTEGER NOT NULL DEFAULT 0,
	defer_until_ms INTEGER,
	replied_at_ms INTEGER,
	refund_draft_filed INTEGER NOT NULL DEFAULT 0 CHECK (refund_draft_filed IN (0,1)),
	last_error_code INTEGER,
	created_at_ms INTEGER NOT NULL DEFAULT 0,
	updated_at_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS lead_states_seller_created_idx ON lead_states (seller_id, created_at_ms);
CREATE INDEX IF NOT EXISTS lead_states_defer_due_idx ON lead_states (route, defer_until_ms);
CREATE INDEX IF NOT EXISTS lead_states_outcome_idx ON lead_states (outcome);
CREATE INDEX IF NOT EXISTS lead_states_fuzzy_idx ON lead_states (fuzzy_key, created_at_ms);

CREATE TABLE IF NOT EXISTS wa_messages (
	id TEXT PRIMARY KEY,
	lead_dedup_key TEXT NOT NULL,
	seller_id TEXT NOT NULL,
	direction TEXT NOT NULL DEFAULT 'outbound_template' CHECK (direction IN ('outbound_template','inbound')),
	template_key TEXT NOT NULL,
	template_vars_json TEXT NOT NULL DEFAULT '[]',
	to_phone TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','accepted','sent','delivered','read','failed')),
	error_code INTEGER,
	error_message TEXT,
	price_micro_inr INTEGER,
	conversation_id TEXT,
	sent_at_ms INTEGER,
	delivered_at_ms INTEGER,
	read_at_ms INTEGER,
	failed_at_ms INTEGER,
	created_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS wa_messages_seller_sent_idx ON wa_messages (seller_id, sent_at_ms);
CREATE INDEX IF NOT EXISTS wa_messages_lead_idx ON wa_messages (lead_dedup_key);
CREATE INDEX IF NOT EXISTS wa_messages_status_idx ON wa_messages (status);
