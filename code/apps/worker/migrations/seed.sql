-- seed.sql — demo data for seller_bj01 "All Flow Pumps" (Hyderabad pump dealer)
-- Apply: bunx wrangler d1 execute lead-state --file migrations/seed.sql --local   (or --remote)
-- Timestamps are relative to execution time: (CAST(strftime('%s','now') AS INTEGER) - offset_sec) * 1000
-- lead_states stores no product/city/priority columns; scenario metadata is documented
-- per-row below and mirrored into wa_messages.template_vars_json.

-- Re-seedable: clear previous demo rows first
DELETE FROM wa_messages WHERE seller_id = 'seller_bj01';
DELETE FROM lead_states WHERE seller_id = 'seller_bj01';
DELETE FROM sellers WHERE id = 'seller_bj01';

-- Seller: All Flow Pumps, owner Ramesh Kumar (GSTIN placeholder in glusr_crm_key)
INSERT INTO sellers (id, company, owner_name, owner_wa_phone, im_webhook_token, glusr_crm_key, wa_phone_id, gmail_refresh_token, catalog_json, status, created_at_ms, updated_at_ms) VALUES (
	'seller_bj01',
	'All Flow Pumps',
	'Ramesh Kumar',
	'+919848012345',
	'tok_bj01_demo_push',
	'36ABCDE1234F1Z5', -- GSTIN placeholder (Telangana)
	'109456789012345',
	NULL,
	'{"homeCity":"Hyderabad","skuPatterns":["pump","power pack","dewatering","slurry"],"quietStartMinIst":1320,"quietEndMinIst":420,"digestMinIst":485}',
	'active',
	(CAST(strftime('%s','now') AS INTEGER) - 2592000) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 2592000) * 1000
);

-- ─── wa_now leads (hot, priority 70–95, SLA 300s) ─────────────────────────────

-- LDBJ01-001 · wa_now · priority 82 · Slurry Pump 7.5HP · Hyderabad · delivered (6d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-001',
	'fz:seller_bj01:mob4801:' || ((CAST(strftime('%s','now') AS INTEGER) - 555120) / 60),
	'LDBJ01-001', 'seller_bj01', 'push', 'wa_now', 'delivered', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 555120) * 1000 + 300000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 555120) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 555000) * 1000
);

-- LDBJ01-002 · wa_now · priority 85 · Centrifugal Pump 10HP · Jeedimetla · delivered (5d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-002',
	'fz:seller_bj01:mob3327:' || ((CAST(strftime('%s','now') AS INTEGER) - 484620) / 60),
	'LDBJ01-002', 'seller_bj01', 'push', 'wa_now', 'delivered', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 484620) * 1000 + 300000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 484620) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 484470) * 1000
);

-- LDBJ01-003 · wa_now · priority 78 · Dewatering Pump 3HP · Balanagar · replied after 40min (4d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-003',
	'fz:seller_bj01:mob9015:' || ((CAST(strftime('%s','now') AS INTEGER) - 378300) / 60),
	'LDBJ01-003', 'seller_bj01', 'push', 'wa_now', 'replied', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 378300) * 1000 + 300000,
	NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 375900) * 1000,
	0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 378300) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 375900) * 1000
);

-- LDBJ01-004 · wa_now · priority 90 · Submersible Pump 5HP · Secunderabad · delivered (2d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-004',
	'fz:seller_bj01:mob7742:' || ((CAST(strftime('%s','now') AS INTEGER) - 215280) / 60),
	'LDBJ01-004', 'seller_bj01', 'push', 'wa_now', 'delivered', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 215280) * 1000 + 300000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 215280) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 215100) * 1000
);

-- LDBJ01-005 · wa_now · priority 74 · Hydraulic Power Pack · Kukatpally · read (1d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-005',
	'fz:seller_bj01:mob6620:' || ((CAST(strftime('%s','now') AS INTEGER) - 145200) / 60),
	'LDBJ01-005', 'seller_bj01', 'push', 'wa_now', 'read', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 145200) * 1000 + 300000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 145200) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 144480) * 1000
);

-- LDBJ01-006 · wa_now · priority 88 · Slurry Pump 7.5HP · Hyderabad · read (today)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-006',
	'fz:seller_bj01:mob1189:' || ((CAST(strftime('%s','now') AS INTEGER) - 20520) / 60),
	'LDBJ01-006', 'seller_bj01', 'push', 'wa_now', 'read', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 20520) * 1000 + 300000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 20520) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 20040) * 1000
);

-- ─── wa_defer_digest leads (warm, priority 45–69; quiet-hours deferrals) ──────

-- LDBJ01-007 · wa_defer_digest · priority 55 · Centrifugal Pump 10HP · Secunderabad · still waiting for 08:05 IST digest (last night)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-007',
	'fz:seller_bj01:mob5503:' || ((CAST(strftime('%s','now') AS INTEGER) - 12600) / 60),
	'LDBJ01-007', 'seller_bj01', 'push', 'wa_defer_digest', 'deferred', 0,
	(CAST(strftime('%s','now') AS INTEGER) - 12600) * 1000 + 900000,
	(CAST(strftime('%s','now') AS INTEGER) + 45000) * 1000,
	NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 12600) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 12600) * 1000
);

-- LDBJ01-008 · wa_defer_digest · priority 60 · Dewatering Pump 3HP · Hyderabad · digest fired this morning, ack sent (arrived yesterday evening)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-008',
	'fz:seller_bj01:mob9931:' || ((CAST(strftime('%s','now') AS INTEGER) - 163800) / 60),
	'LDBJ01-008', 'seller_bj01', 'push', 'wa_defer_digest', 'sent', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 163800) * 1000 + 900000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 163800) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 127800) * 1000
);

-- ─── human leads (warm, priority 45–69, SLA 900s; routed to owner follow-up) ──

-- LDBJ01-009 · human · priority 58 · Submersible Pump 5HP · Kukatpally · sent by owner after 20min (3d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-009',
	'fz:seller_bj01:mob2048:' || ((CAST(strftime('%s','now') AS INTEGER) - 303300) / 60),
	'LDBJ01-009', 'seller_bj01', 'push', 'human', 'sent', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 303300) * 1000 + 900000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 303300) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 302100) * 1000
);

-- LDBJ01-010 · human · priority 52 · Hydraulic Power Pack · Balanagar · sent by owner after 20min (2d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-010',
	'fz:seller_bj01:mob8376:' || ((CAST(strftime('%s','now') AS INTEGER) - 226920) / 60),
	'LDBJ01-010', 'seller_bj01', 'push', 'human', 'sent', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 226920) * 1000 + 900000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 226920) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 225720) * 1000
);

-- LDBJ01-011 · human · priority 47 · Centrifugal Pump 10HP · Jeedimetla · sent by owner after 40min (5d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-011',
	'fz:seller_bj01:mob4417:' || ((CAST(strftime('%s','now') AS INTEGER) - 495840) / 60),
	'LDBJ01-011', 'seller_bj01', 'push', 'human', 'sent', 1,
	(CAST(strftime('%s','now') AS INTEGER) - 495840) * 1000 + 900000,
	NULL, NULL, 0, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 495840) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 494640) * 1000
);

-- ─── silent_spam leads (priority 0–20, skipped silently, refund draft filed) ──

-- LDBJ01-012 · silent_spam · priority 0 · query: "send project report ppt for pumps" (6d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-012',
	'fz:seller_bj01:nomob:' || ((CAST(strftime('%s','now') AS INTEGER) - 566460) / 60),
	'LDBJ01-012', 'seller_bj01', 'push', 'silent_spam', 'spam_skipped', 0,
	(CAST(strftime('%s','now') AS INTEGER) - 566460) * 1000,
	NULL, NULL, 1, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 566460) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 566460) * 1000
);

-- LDBJ01-013 · silent_spam · priority 0 · query: "college internship syllabus needed" (4d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-013',
	'fz:seller_bj01:mob2210:' || ((CAST(strftime('%s','now') AS INTEGER) - 385740) / 60),
	'LDBJ01-013', 'seller_bj01', 'push', 'silent_spam', 'spam_skipped', 0,
	(CAST(strftime('%s','now') AS INTEGER) - 385740) * 1000,
	NULL, NULL, 1, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 385740) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 385740) * 1000
);

-- LDBJ01-014 · silent_spam · priority 5 · vague one-word query, no city (3d ago)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-014',
	'fz:seller_bj01:mob7789:' || ((CAST(strftime('%s','now') AS INTEGER) - 298980) / 60),
	'LDBJ01-014', 'seller_bj01', 'push', 'silent_spam', 'spam_skipped', 0,
	(CAST(strftime('%s','now') AS INTEGER) - 298980) * 1000,
	NULL, NULL, 1, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 298980) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 298980) * 1000
);

-- LDBJ01-015 · silent_spam · priority 5 · vague short query, no mobile (yesterday)
INSERT INTO lead_states (dedup_key, fuzzy_key, lead_id, seller_id, source, route, outcome, attempts, sla_due_at_ms, defer_until_ms, replied_at_ms, refund_draft_filed, last_error_code, created_at_ms, updated_at_ms) VALUES (
	'lead:seller_bj01:LDBJ01-015',
	'fz:seller_bj01:nomob:' || ((CAST(strftime('%s','now') AS INTEGER) - 156420) / 60),
	'LDBJ01-015', 'seller_bj01', 'push', 'silent_spam', 'spam_skipped', 0,
	(CAST(strftime('%s','now') AS INTEGER) - 156420) * 1000,
	NULL, NULL, 1, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 156420) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 156420) * 1000
);

-- ─── WhatsApp messages (8 outbound acks for sent/delivered/read/replied leads) ─

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_001', 'lead:seller_bj01:LDBJ01-001', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Slurry Pump 7.5HP","All Flow Pumps","LDBJ01-001"]',
	'+919866148010', 'delivered', NULL, NULL, 125000, 'wabp_demo_bj01_001',
	(CAST(strftime('%s','now') AS INTEGER) - 555075) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 554940) * 1000,
	NULL, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 555075) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_002', 'lead:seller_bj01:LDBJ01-002', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Centrifugal Pump 10HP","All Flow Pumps","LDBJ01-002"]',
	'+919866133271', 'delivered', NULL, NULL, 125000, 'wabp_demo_bj01_002',
	(CAST(strftime('%s','now') AS INTEGER) - 484568) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 484420) * 1000,
	NULL, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 484568) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_003', 'lead:seller_bj01:LDBJ01-003', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Dewatering Pump 3HP","All Flow Pumps","LDBJ01-003"]',
	'+919866190150', 'read', NULL, NULL, 125000, 'wabp_demo_bj01_003',
	(CAST(strftime('%s','now') AS INTEGER) - 378262) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 378150) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 375900) * 1000,
	NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 378262) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_004', 'lead:seller_bj01:LDBJ01-004', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Submersible Pump 5HP","All Flow Pumps","LDBJ01-004"]',
	'+919866177426', 'delivered', NULL, NULL, 125000, 'wabp_demo_bj01_004',
	(CAST(strftime('%s','now') AS INTEGER) - 215219) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 215085) * 1000,
	NULL, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 215219) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_005', 'lead:seller_bj01:LDBJ01-005', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Hydraulic Power Pack","All Flow Pumps","LDBJ01-005"]',
	'+919866166208', 'read', NULL, NULL, 125000, 'wabp_demo_bj01_005',
	(CAST(strftime('%s','now') AS INTEGER) - 145153) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 145040) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 144480) * 1000,
	NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 145153) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_006', 'lead:seller_bj01:LDBJ01-006', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Slurry Pump 7.5HP","All Flow Pumps","LDBJ01-006"]',
	'+919866111895', 'read', NULL, NULL, 125000, 'wabp_demo_bj01_006',
	(CAST(strftime('%s','now') AS INTEGER) - 20481) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 20380) * 1000,
	(CAST(strftime('%s','now') AS INTEGER) - 20040) * 1000,
	NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 20481) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_007', 'lead:seller_bj01:LDBJ01-008', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Dewatering Pump 3HP","All Flow Pumps","LDBJ01-008"]',
	'+919866199315', 'sent', NULL, NULL, 125000, 'wabp_demo_bj01_007',
	(CAST(strftime('%s','now') AS INTEGER) - 127800) * 1000,
	NULL, NULL, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 127800) * 1000
);

INSERT INTO wa_messages (id, lead_dedup_key, seller_id, direction, template_key, template_vars_json, to_phone, status, error_code, error_message, price_micro_inr, conversation_id, sent_at_ms, delivered_at_ms, read_at_ms, failed_at_ms, created_at_ms) VALUES (
	'wm_bj01_008', 'lead:seller_bj01:LDBJ01-009', 'seller_bj01', 'outbound_template', 'enquiry_ack_utility',
	'["Ramesh Kumar","Submersible Pump 5HP","All Flow Pumps","LDBJ01-009"]',
	'+919866120482', 'sent', NULL, NULL, 125000, 'wabp_demo_bj01_008',
	(CAST(strftime('%s','now') AS INTEGER) - 302100) * 1000,
	NULL, NULL, NULL,
	(CAST(strftime('%s','now') AS INTEGER) - 302100) * 1000
);
