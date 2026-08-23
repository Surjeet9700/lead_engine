// SOTA Engine Unit Tests: Spec Extraction, Dispute Engine, Voice Agent, and Interactive WhatsApp
import { describe, expect, it } from 'bun:test';
import { extractPumpSpecs } from '../src/domain/llm-spec';
import { extractDynamicAttributes } from '../src/domain/schema-engine';
import { evaluateBuyLeadDispute } from '../src/domain/dispute-engine';
import { buildTelephonyPrompt } from '../src/adapters/voice/telephony-bridge';
import { RealtimeVoiceAgent } from '../src/adapters/voice/realtime-agent';
import { reconcileSellerPullLeads } from '../src/reconciler';
import type { NormalizedLead } from '../src/domain';

describe('SOTA Spec Qualifier (extractPumpSpecs)', () => {
	it('extracts vertical multistage pump with 15HP and three-phase voltage', () => {
		const text = 'Require 15 HP vertical multistage pump for RO water plant in Balanagar. 3 phase 415V.';
		const spec = extractPumpSpecs(text, 'Multistage Water Pump');

		expect(spec.pumpType).toBe('vertical_multistage');
		expect(spec.powerHp).toBe(15);
		expect(spec.phase).toBe('three_phase');
		expect(spec.voltage).toBe(415);
		expect(spec.isAcademicSpam).toBe(false);
		expect(spec.commercialIntentScore).toBeGreaterThanOrEqual(75);
		expect(spec.matchedCatalogSku).toBe('15HP High-Head Vertical Multistage Pump');
	});

	it('extracts submersible borewell with HP, head, and LPM', () => {
		const text = 'Looking for 7.5 HP submersible pump 120m head 250 LPM delivery for factory site';
		const spec = extractPumpSpecs(text, 'Submersible Borewell Pump');

		expect(spec.pumpType).toBe('submersible_borewell');
		expect(spec.powerHp).toBe(7.5);
		expect(spec.headMeters).toBe(120);
		expect(spec.flowLpm).toBe(250);
		expect(spec.isAcademicSpam).toBe(false);
		expect(spec.matchedCatalogSku).toBe('7.5HP Heavy-Duty Borewell Submersible Pump');
	});

	it('detects college project / academic spam with zero intent score', () => {
		const text = 'Need pump project PPT and synopsis for B.Tech final year mechanical syllabus';
		const spec = extractPumpSpecs(text, 'Pump Project Inquiry');

		expect(spec.isAcademicSpam).toBe(true);
		expect(spec.commercialIntentScore).toBe(0);
		expect(spec.confidence).toBeGreaterThanOrEqual(0.9);
	});

	it('handles half HP single-phase monoblock domestic pumps', () => {
		const text = '1/2 hp single phase domestic monoblock pump required for home';
		const spec = extractPumpSpecs(text, 'Centrifugal Pump');

		expect(spec.powerHp).toBe(0.5);
		expect(spec.phase).toBe('single_phase');
		expect(spec.voltage).toBe(230);
	});
});

describe('Dynamic Multi-Industry Schema Engine (extractDynamicAttributes)', () => {
	it('dynamically extracts Air Compressor specifications and matches Screw Compressor SKU', () => {
		const text = 'Require 20 HP rotary screw air compressor with 10 bar working pressure and 85 cfm delivery for manufacturing line';
		const result = extractDynamicAttributes(text, 'Industrial Air Compressor');

		expect(result.categoryId).toBe('air_compressors');
		expect(result.attributes['power']?.normalizedValue).toBe(20);
		expect(result.attributes['pressure']?.normalizedValue).toBe(10);
		expect(result.attributes['airflow']?.normalizedValue).toBe(85);
		expect(result.attributes['compressor_type']?.normalizedValue).toBe('rotary_screw');
		expect(result.matchedSku?.skuId).toBe('SCREW-20-10B');
		expect(result.commercialIntentScore).toBeGreaterThanOrEqual(75);
	});

	it('dynamically extracts Diesel Generator specifications with kVA capacity and silent canopy', () => {
		const text = 'Urgent requirement: 62.5 kVA CPCB acoustic silent diesel generator set with water cooling';
		const result = extractDynamicAttributes(text, 'Diesel Genset');

		expect(result.categoryId).toBe('diesel_generators');
		expect(result.attributes['capacity_kva']?.normalizedValue).toBe(62.5);
		expect(result.attributes['canopy_type']?.normalizedValue).toBe('silent_canopy');
		expect(result.attributes['cooling_system']?.normalizedValue).toBe('water_cooled');
		expect(result.matchedSku?.skuId).toBe('DG-62.5-CPCB');
	});

	it('converts units dynamically across schemas (kW to HP, PSI to Bar)', () => {
		const text = '15 kw screw compressor operating at 145 psi pressure';
		const result = extractDynamicAttributes(text, 'Air Compressor');

		expect(result.categoryId).toBe('air_compressors');
		// 15 kW * 1.341 = 20.12 HP
		expect(result.attributes['power']?.normalizedValue).toBeCloseTo(20.12, 1);
		// 145 PSI * 0.06895 = 10 Bar
		expect(result.attributes['pressure']?.normalizedValue).toBeCloseTo(10, 0);
	});

	it('supports seller-defined custom category schema with arbitrary attributes', () => {
		const customSolarSchema = {
			id: 'solar_inverters',
			name: 'Solar Inverters & Batteries',
			categoryPatterns: [/\b(solar|inverter|mppt|tubular\s*battery)\b/i],
			attributes: [
				{
					key: 'inverter_capacity',
					label: 'Inverter Capacity',
					type: 'number' as const,
					unit: 'kVA',
					extractRegex: /(\d+(?:\.\d+)?)\s*(?:kva|kw)\b/i,
				},
				{
					key: 'battery_ah',
					label: 'Battery Capacity',
					type: 'number' as const,
					unit: 'Ah',
					extractRegex: /(\d+)\s*(?:ah|amp\s*hours)\b/i,
				},
			],
		};

		const text = 'Need 10 kVA MPPT solar inverter with 200 Ah tubular battery bank';
		const result = extractDynamicAttributes(text, 'Solar Inverter', customSolarSchema);

		expect(result.categoryId).toBe('solar_inverters');
		expect(result.attributes['inverter_capacity']?.normalizedValue).toBe(10);
		expect(result.attributes['battery_ah']?.normalizedValue).toBe(200);
	});
});

describe('SOTA BuyLead Dispute Engine (evaluateBuyLeadDispute)', () => {
	const mockNow = new Date('2026-08-22T10:00:00Z');

	it('generates ₹350 dispute refund claim for academic student inquiries', () => {
		const lead: NormalizedLead = {
			leadId: 'IM-99180',
			sellerId: 'seller_bj01',
			mobile: '9848022338',
			productName: 'Pump Inquiry',
			queryMessage: 'Pump project PPT for diploma syllabus assignment',
			city: 'Hyderabad',
			callDurationSec: 0,
			source: 'push',
			receivedAtMs: Date.now(),
		};

		const spec = extractPumpSpecs(lead.queryMessage, lead.productName);
		const dispute = evaluateBuyLeadDispute(lead, spec, mockNow);

		expect(dispute.eligible).toBe(true);
		expect(dispute.category).toBe('academic_project');
		expect(dispute.creditValueInr).toBe(350);
		expect(dispute.ticketSubject).toContain('Academic Inquiry [Lead #IM-99180]');
		expect(dispute.disputeDraftText).toContain('IndiaMart Seller Protection & Buyer Quality Policy §3.2');
	});

	it('generates refund claim for dummy / invalid phone numbers', () => {
		const lead: NormalizedLead = {
			leadId: 'IM-99181',
			sellerId: 'seller_bj01',
			mobile: '9999999999', // repetitive dummy phone
			productName: 'Industrial Pump',
			queryMessage: 'Urgent pump quote',
			city: 'Hyderabad',
			callDurationSec: 0,
			source: 'push',
			receivedAtMs: Date.now(),
		};

		const spec = extractPumpSpecs(lead.queryMessage, lead.productName);
		const dispute = evaluateBuyLeadDispute(lead, spec, mockNow);

		expect(dispute.eligible).toBe(true);
		expect(dispute.category).toBe('invalid_phone');
		expect(dispute.creditValueInr).toBe(350);
	});

	it('rejects dispute claim for legitimate high-intent industrial buyer leads', () => {
		const lead: NormalizedLead = {
			leadId: 'IM-99210',
			sellerId: 'seller_bj01',
			mobile: '9876543210',
			productName: 'Vertical Multistage Pump CR-15',
			queryMessage: 'Need 15HP CR-15 pump for Balanagar plant immediately',
			city: 'Hyderabad',
			callDurationSec: 45,
			source: 'push',
			receivedAtMs: Date.now(),
		};

		const spec = extractPumpSpecs(lead.queryMessage, lead.productName);
		const dispute = evaluateBuyLeadDispute(lead, spec, mockNow);

		expect(dispute.eligible).toBe(false);
		expect(dispute.creditValueInr).toBe(0);
	});
});

describe('SOTA Voice Subsystem', () => {
	it('builds natural Telugu and Hindi telephony prompts', () => {
		const teluguPrompt = buildTelephonyPrompt('Suresh', 'CR-15 15HP Pump', 'Bharat Pumps', 'Balanagar', 'te-IN');
		expect(teluguPrompt).toContain('Namaskaram Suresh garu');
		expect(teluguPrompt).toContain('Bharat Pumps');
		expect(teluguPrompt).toContain('1 press cheyandi');

		const hindiPrompt = buildTelephonyPrompt('Suresh', 'CR-15 15HP Pump', 'Bharat Pumps', 'Balanagar', 'hi-IN');
		expect(hindiPrompt).toContain('Namaste Suresh');
		expect(hindiPrompt).toContain('1 dabayein');
	});

	it('realtime voice agent qualifies buyer specs across conversational turns', () => {
		const agent = new RealtimeVoiceAgent('mock_sarvam_key', 'Bharat Pumps & Equipment');
		const session = {
			sessionId: 'sess_1',
			leadDedupKey: 'lead:bj01:IM-99210',
			sellerId: 'seller_bj01',
			buyerPhone: '9876543210',
			language: 'hi-IN' as const,
			turns: [],
			status: 'active' as const,
		};

		// Turn 1: Buyer mentions 15HP Vertical Multistage
		const turn1 = agent.processBuyerTurn(session, 'Mujhe 15 HP ka vertical multistage pump chahiye 120 meter head ke liye');

		expect(turn1.isReadyToQuote).toBe(true);
		expect(turn1.updatedSpec.powerHp).toBe(15);
		expect(turn1.updatedSpec.headMeters).toBe(120);
		expect(turn1.responseText).toContain('15HP requirement');
		expect(turn1.responseText).toContain('WhatsApp');
	});
});

describe('IndiaMart GLUSR Pull Reconciler (reconcileSellerPullLeads)', () => {
	it('skips reconciliation gracefully when glusr_crm_key is missing', async () => {
		const catalog = {
			sellerId: 'seller_bj01',
			company: 'Bharat Pumps',
			ownerName: 'Suresh',
			ownerWaPhone: '919848022338',
			skuPatterns: [/pump/i],
			homeCity: 'Hyderabad',
			quietStartMinIst: 1320,
			quietEndMinIst: 420,
			digestMinIst: 485,
		};

		const result = await reconcileSellerPullLeads(
			'seller_bj01',
			'9848022338',
			'', // empty key
			catalog,
			{
				dedup: { claim: async () => true },
				queue: { send: async () => {} },
			},
		);

		expect(result.fetchedCount).toBe(0);
		expect(result.newLeadsEnqueued).toBe(0);
	});
});
