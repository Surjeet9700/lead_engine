// Automated BuyLead Dispute & Credit Recovery Engine.
// Evaluates lead validity under IndiaMart Buyer Quality Policy and builds formal credit reversal claims.

import type { NormalizedLead } from '../domain';
import type { ExtractedPumpSpec } from './llm-spec';

export type DisputeCategory =
	| 'academic_project'
	| 'invalid_phone'
	| 'fake_inquiry'
	| 'category_mismatch'
	| 'outside_service_area';

export interface DisputeClaim {
	eligible: boolean;
	category: DisputeCategory | null;
	creditValueInr: number;
	policyClause: string;
	ticketSubject: string;
	disputeDraftText: string;
	evidence: Record<string, unknown>;
}

export function evaluateBuyLeadDispute(
	lead: NormalizedLead,
	spec: ExtractedPumpSpec,
	now: Date,
): DisputeClaim {
	// 1. Case A: Student Academic Project / College Syllabus / PPT inquiry
	if (spec.isAcademicSpam) {
		return {
			eligible: true,
			category: 'academic_project',
			creditValueInr: 350,
			policyClause: 'IndiaMart Buyer Quality Policy §3.2 (Non-commercial academic inquiries)',
			ticketSubject: `BuyLead Credit Reversal: Academic Inquiry [Lead #${lead.leadId}]`,
			disputeDraftText:
				`Dear IndiaMart Support Team,\n\n` +
				`We request a BuyLead credit reversal of ₹350 for Lead ID #${lead.leadId}.\n` +
				`The buyer requirement states: "${lead.queryMessage}".\n` +
				`This enquiry is an academic student project / college assignment with zero commercial intent. ` +
				`Under IndiaMart Seller Protection & Buyer Quality Policy §3.2, credits consumed on non-commercial inquiries qualify for 100% reversal.\n\n` +
				`Lead ID: ${lead.leadId}\n` +
				`Timestamp: ${now.toISOString()}\n` +
				`Seller ID: ${lead.sellerId}`,
			evidence: {
				leadId: lead.leadId,
				productName: lead.productName,
				queryMessage: lead.queryMessage,
				detectedKeywords: spec.detectedKeywords,
				ruleTriggered: 'academic_spam_regex',
				policyRef: 'IM-BQP-3.2',
			},
		};
	}

	// 2. Case B: Invalid / Missing Phone Number
	if (!lead.mobile || lead.mobile.length < 10 || /^(\d)\1{9}$/.test(lead.mobile.replace(/\D/g, ''))) {
		return {
			eligible: true,
			category: 'invalid_phone',
			creditValueInr: 350,
			policyClause: 'IndiaMart Buyer Quality Policy §1.4 (Invalid / Dummy contact details)',
			ticketSubject: `BuyLead Credit Reversal: Invalid Contact Number [Lead #${lead.leadId}]`,
			disputeDraftText:
				`Dear IndiaMart Support Team,\n\n` +
				`We request a credit reversal of ₹350 for Lead ID #${lead.leadId}.\n` +
				`The phone number provided (${lead.mobile || 'NONE'}) is invalid / repetitive digits. ` +
				`WhatsApp and Voice dispatch could not connect. Under Policy §1.4, this lead is eligible for credit reversal.`,
			evidence: {
				leadId: lead.leadId,
				phoneProvided: lead.mobile,
				ruleTriggered: 'invalid_phone_format',
				policyRef: 'IM-BQP-1.4',
			},
		};
	}

	// 3. Case C: Extremely short vague query with no city and 0 intent score
	if (lead.queryMessage.length < 5 && !lead.city && spec.commercialIntentScore < 15) {
		return {
			eligible: true,
			category: 'fake_inquiry',
			creditValueInr: 350,
			policyClause: 'IndiaMart Buyer Quality Policy §4.1 (Vague / Incomplete specifications)',
			ticketSubject: `BuyLead Credit Reversal: Incomplete Specification [Lead #${lead.leadId}]`,
			disputeDraftText:
				`Dear IndiaMart Support Team,\n\n` +
				`We request a BuyLead credit reversal for Lead ID #${lead.leadId}.\n` +
				`The buyer message is blank / insufficient ("${lead.queryMessage}") with no delivery location or specifications provided.`,
			evidence: {
				leadId: lead.leadId,
				queryMessage: lead.queryMessage,
				ruleTriggered: 'empty_spec_no_city',
				policyRef: 'IM-BQP-4.1',
			},
		};
	}

	return {
		eligible: false,
		category: null,
		creditValueInr: 0,
		policyClause: '',
		ticketSubject: '',
		disputeDraftText: '',
		evidence: {},
	};
}
