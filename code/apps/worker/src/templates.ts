// Seller lifecycle WA Cloud API templates + Graph submission helper. IMPORTS: none.
// All messages go to SELLERS (opted-in owners), never buyers. Category is UTILITY wherever
// Meta rules allow: transactional, factual, no promotional language -> free tier + fast review.

export interface WaTemplate {
	name: string;
	category: "UTILITY" | "MARKETING";
	language: string;
	body: string;
	exampleValues: string[];
	variableDescriptions: Record<string, string>;
	buttons?: { type: "QUICK_REPLY" | "URL"; text: string; url?: string }[];
}

export const TEMPLATES: Record<string, WaTemplate> = {
	// --- Welcome sequence (post-onboarding) ---

	welcome_day0: {
		name: "welcome_day0",
		category: "UTILITY",
		language: "en_US",
		body:
			"Welcome to Lead Speed Engine, {{1}}! Your workspace for {{2}} is ready. " +
			"We are connecting your IndiaMART Push API next. Instant lead alerts start arriving on this " +
			"number as soon as it is live - usually within 24 hours.",
		exampleValues: ["Ramesh", "Sri Balaji Pumps"],
		variableDescriptions: {
			"{{1}}": "Seller owner first name",
			"{{2}}": "Registered company name",
		},
		buttons: [{ type: "URL", text: "Open dashboard", url: "https://app.leadspeed.in/setup" }],
	},

	welcome_day3: {
		name: "welcome_day3",
		category: "UTILITY",
		language: "en_US",
		body:
			"Hi {{1}}, day 3 check-in from Lead Speed Engine. Your IndiaMART Push API status: {{2}}. " +
			"If it is not live yet, reply to this message and our team will finish the setup with you today.",
		exampleValues: ["Ramesh", "Connected"],
		variableDescriptions: {
			"{{1}}": "Seller owner first name",
			"{{2}}": "Push API connection status (Connected / Pending)",
		},
		buttons: [{ type: "QUICK_REPLY", text: "Setup not done" }],
	},

	welcome_day7: {
		name: "welcome_day7",
		category: "UTILITY",
		language: "en_US",
		body:
			"Hi {{1}}, your first week with Lead Speed Engine: {{2}} leads received, fastest alert " +
			"delivered {{3}} seconds after the lead landed on IndiaMART. Tip: sellers who respond to HOT " +
			"leads within 5 minutes win most orders. Your dashboard keeps every lead with timestamps.",
		exampleValues: ["Ramesh", "23", "41"],
		variableDescriptions: {
			"{{1}}": "Seller owner first name",
			"{{2}}": "Leads received in first week (integer)",
			"{{3}}": "Fastest alert delivery time in seconds (integer)",
		},
	},

	// --- Lead notifications ---

	hot_lead_alert: {
		name: "hot_lead_alert",
		category: "UTILITY",
		language: "en_US",
		body:
			'HOT LEAD for {{1}}: buyer from {{2}} enquired about {{3}}. Buyer said: "{{4}}". ' +
			"Responding inside 5 minutes sharply raises order odds - call or message the buyer now from your dashboard.",
		exampleValues: [
			"Sri Balaji Pumps",
			"Hyderabad",
			"3 HP monoblock pump",
			"Need price for 10 pieces",
		],
		variableDescriptions: {
			"{{1}}": "Company name",
			"{{2}}": "Buyer city",
			"{{3}}": "Product the buyer enquired about",
			"{{4}}": "Buyer's query message (truncated to 100 chars)",
		},
		buttons: [{ type: "URL", text: "Open lead", url: "https://app.leadspeed.in/leads/latest" }],
	},

	daily_digest: {
		name: "daily_digest",
		category: "UTILITY",
		language: "en_US",
		body:
			"Good morning {{1}}. Overnight leads for {{2}}: {{3}} total - {{4}} HOT, {{5}} warm. " +
			"Most requested item: {{6}}. Open your dashboard and respond before competitors do.",
		exampleValues: ["Ramesh", "12 Aug", "7", "2", "5", "centrifugal pump 2 HP"],
		variableDescriptions: {
			"{{1}}": "Seller owner first name",
			"{{2}}": "Digest date (e.g. 12 Aug)",
			"{{3}}": "Total overnight leads (integer)",
			"{{4}}": "HOT priority leads (integer)",
			"{{5}}": "WARM priority leads (integer)",
			"{{6}}": "Most requested product across overnight leads",
		},
		buttons: [{ type: "URL", text: "Open dashboard", url: "https://app.leadspeed.in/leads" }],
	},

	weekly_report: {
		name: "weekly_report",
		category: "UTILITY",
		language: "en_US",
		body:
			"Weekly report for {{1}} ({{2}} to {{3}}): {{4}} leads received, {{5}} answered within SLA, " +
			"average first response {{6}} seconds. {{7}} junk leads filed for refund credit.",
		exampleValues: ["Ramesh", "5 Aug", "11 Aug", "31", "27", "58", "3"],
		variableDescriptions: {
			"{{1}}": "Seller owner first name",
			"{{2}}": "Week start date (e.g. 5 Aug)",
			"{{3}}": "Week end date (e.g. 11 Aug)",
			"{{4}}": "Leads received during week (integer)",
			"{{5}}": "Leads answered within SLA (integer)",
			"{{6}}": "Average first response time in seconds (integer)",
			"{{7}}": "Junk leads filed for refund during week (integer)",
		},
		buttons: [{ type: "URL", text: "Full report", url: "https://app.leadspeed.in/reports" }],
	},

	// --- Billing ---

	payment_success: {
		name: "payment_success",
		category: "UTILITY",
		language: "en_US",
		body:
			"Payment received: ₹{{1}} for your {{2}} plan (invoice {{3}}). Your GST invoice is available " +
			"in the billing portal. Lead alerts continue uninterrupted.",
		exampleValues: ["1999.00", "Growth monthly", "INV-2026-0091"],
		variableDescriptions: {
			"{{1}}": "Amount paid in INR with decimals (e.g. 1999.00)",
			"{{2}}": "Plan name and billing period",
			"{{3}}": "GST invoice number",
		},
		buttons: [{ type: "URL", text: "View invoice", url: "https://billing.leadspeed.in/invoices" }],
	},

	payment_failed: {
		name: "payment_failed",
		category: "UTILITY",
		language: "en_US",
		body:
			"Your payment of ₹{{1}} for {{2}} failed (reason: {{3}}). Update your UPI Autopay mandate to " +
			"keep instant lead alerts active. Alerts pause if payment is not completed within 72 hours.",
		exampleValues: ["1999.00", "Growth monthly", "insufficient balance"],
		variableDescriptions: {
			"{{1}}": "Failed amount in INR with decimals",
			"{{2}}": "Plan name and billing period",
			"{{3}}": "Failure reason from PSP (short, lowercase)",
		},
		buttons: [{ type: "URL", text: "Update mandate", url: "https://billing.leadspeed.in/mandate" }],
	},

	service_paused: {
		name: "service_paused",
		category: "UTILITY",
		language: "en_US",
		body:
			"Lead alerts for {{1}} are paused because payment of ₹{{2}} is pending. New leads are still " +
			"being captured safely. Complete payment to resume instant WhatsApp alerts.",
		exampleValues: ["Sri Balaji Pumps", "1999.00"],
		variableDescriptions: {
			"{{1}}": "Company name",
			"{{2}}": "Pending amount in INR with decimals",
		},
		buttons: [{ type: "URL", text: "Pay now", url: "https://billing.leadspeed.in/pay" }],
	},

	// --- Recovery (junk credit refunds via IndiaMART KAM) ---

	refund_filed: {
		name: "refund_filed",
		category: "UTILITY",
		language: "en_US",
		body:
			"Junk lead refund filed with your IndiaMART KAM for {{1}} lead(s), including {{2}}. " +
			"Expected credit: ₹{{3}}. Typical approval takes {{4}} working days - we track it and update you here.",
		exampleValues: ["3", "UNIQ-88213", "34.50", "7"],
		variableDescriptions: {
			"{{1}}": "Number of junk leads filed (integer)",
			"{{2}}": "Lead ID of the primary junk lead",
			"{{3}}": "Expected refund credit in INR with decimals",
			"{{4}}": "Typical approval window in working days (integer)",
		},
	},

	refund_approved: {
		name: "refund_approved",
		category: "UTILITY",
		language: "en_US",
		body:
			"Refund approved: ₹{{1}} credited to your IndiaMART balance for junk lead {{2}}. " +
			"The credit reflects against your next lead billing cycle.",
		exampleValues: ["34.50", "UNIQ-88213"],
		variableDescriptions: {
			"{{1}}": "Credited amount in INR with decimals",
			"{{2}}": "Lead ID of the refunded junk lead",
		},
	},
};

const GRAPH_BASE = "https://graph.facebook.com/v25.0";

interface GraphSubmitResponse {
	id?: string;
	status?: string;
	error?: { message?: string };
}

function toComponents(t: WaTemplate): Record<string, unknown>[] {
	const components: Record<string, unknown>[] = [
		{ type: "BODY", text: t.body, example: { body_text: [t.exampleValues] } },
	];
	if (t.buttons?.length) {
		components.push({
			type: "BUTTONS",
			buttons: t.buttons.map((b) =>
				b.type === "URL"
					? { type: "URL", text: b.text, url: b.url }
					: { type: "QUICK_REPLY", text: b.text },
			),
		});
	}
	return components;
}

export interface TemplateSubmitResult {
	name: string;
	ok: boolean;
	templateId?: string;
	status?: string;
	error?: string;
}

/** Submits every template in TEMPLATES to the WABA for Meta approval, sequentially, one result each. */
export async function submitAllTemplates(
	wabaId: string,
	token: string,
): Promise<TemplateSubmitResult[]> {
	const results: TemplateSubmitResult[] = [];
	for (const t of Object.values(TEMPLATES)) {
		try {
			const res = await fetch(`${GRAPH_BASE}/${wabaId}/message_templates`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
				body: JSON.stringify({
					name: t.name,
					category: t.category,
					language: t.language,
					components: toComponents(t),
				}),
			});
			const data = (await res.json().catch(() => ({}))) as GraphSubmitResponse;
			if (res.ok) {
				results.push({
					name: t.name,
					ok: true,
					...(data.id ? { templateId: data.id } : {}),
					...(data.status ? { status: data.status } : {}),
				});
			} else {
				results.push({
					name: t.name,
					ok: false,
					error: data.error?.message ?? `HTTP ${res.status}`,
				});
			}
		} catch (e) {
			results.push({
				name: t.name,
				ok: false,
				error: e instanceof Error ? e.message : "network error",
			});
		}
	}
	return results;
}
