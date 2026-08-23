// Meta WhatsApp Interactive Flows & Dynamic Spec Picker Engine (Graph API v25.0).
// Creates native button pickers, interactive selection lists, and WhatsApp Flow bottom-sheets.

export interface WaInteractiveButton {
	id: string;
	title: string; // Max 20 chars per Meta Graph API rules
}

export interface WaListSection {
	title: string;
	rows: {
		id: string;
		title: string;
		description?: string;
	}[];
}

export interface WaInteractivePayload {
	messaging_product: 'whatsapp';
	recipient_type: 'individual';
	to: string;
	type: 'interactive';
	interactive: {
		type: 'button' | 'list' | 'flow';
		header?: {
			type: 'text';
			text: string;
		};
		body: {
			text: string;
		};
		footer?: {
			text: string;
		};
		action: {
			buttons?: {
				type: 'reply';
				reply: {
					id: string;
					title: string;
				};
			}[];
			button?: string; // List trigger title e.g. "Select Pump Spec"
			sections?: WaListSection[];
			parameters?: Record<string, unknown>;
		};
	};
}

/**
 * Builds an interactive 3-button quick quotation response.
 */
export function buildQuickSpecButtons(
	recipientPhone: string,
	productName: string,
	sellerCompany: string,
	recommendedSku: string,
	leadId: string,
): WaInteractivePayload {
	return {
		messaging_product: 'whatsapp',
		recipient_type: 'individual',
		to: recipientPhone,
		type: 'interactive',
		interactive: {
			type: 'button',
			header: {
				type: 'text',
				text: `⚡ Fast Quotation · ${sellerCompany}`,
			},
			body: {
				text:
					`Namaste! We received your IndiaMart inquiry for *${productName}*.\n\n` +
					`Our engineering team matched your requirement to model *${recommendedSku}* (Ready in Stock for Immediate Dispatch).\n\n` +
					`Please select how you would like to proceed:`,
			},
			footer: {
				text: 'Sub-45s Lead Speed Engine · TRAI/DLT Verified',
			},
			action: {
				buttons: [
					{
						type: 'reply',
						reply: {
							id: `btn_pdf_quote_${leadId}`,
							title: '📥 PDF Quotation',
						},
					},
					{
						type: 'reply',
						reply: {
							id: `btn_call_eng_${leadId}`,
							title: '📞 Talk to Engineer',
						},
					},
					{
						type: 'reply',
						reply: {
							id: `btn_change_hp_${leadId}`,
							title: '⚙️ Change Specs/HP',
						},
					},
				],
			},
		},
	};
}

/**
 * Builds an interactive category spec selector list for drill-down customization.
 */
export function buildSpecSelectorList(
	recipientPhone: string,
	category: string,
	sellerCompany: string,
	leadId: string,
): WaInteractivePayload {
	let sections: WaListSection[] = [];

	if (category === 'industrial_pumps') {
		sections = [
			{
				title: 'Vertical Multistage (High Head)',
				rows: [
					{ id: `spec_vms_10hp_${leadId}`, title: '10 HP · 80m Head', description: 'RO Plants & Boiler Feed (200 LPM)' },
					{ id: `spec_vms_15hp_${leadId}`, title: '15 HP · 120m Head', description: 'Industrial Water Treatment (250 LPM)' },
					{ id: `spec_vms_20hp_${leadId}`, title: '20 HP · 160m Head', description: 'Heavy Commercial Pressure Boosting' },
				],
			},
			{
				title: 'Borewell Submersible (6" & 8")',
				rows: [
					{ id: `spec_sub_7hp_${leadId}`, title: '7.5 HP Submersible', description: 'Agriculture & Borewell (300 ft)' },
					{ id: `spec_sub_10hp_${leadId}`, title: '10 HP Submersible', description: 'High-Discharge Farm Irrigation (450 ft)' },
				],
			},
		];
	} else if (category === 'air_compressors') {
		sections = [
			{
				title: 'Rotary Screw Compressors',
				rows: [
					{ id: `spec_cmp_15hp_${leadId}`, title: '15 HP Screw · 8 Bar', description: '55 CFM Continuous Laser/CNC' },
					{ id: `spec_cmp_20hp_${leadId}`, title: '20 HP Screw · 8 Bar', description: '70 CFM Fabrication Workshop' },
					{ id: `spec_cmp_30hp_${leadId}`, title: '30 HP Screw · 10 Bar', description: '110 CFM Heavy Industrial Duty' },
				],
			},
		];
	} else {
		sections = [
			{
				title: 'Standard Industrial Ratings',
				rows: [
					{ id: `spec_std_opt1_${leadId}`, title: 'Standard Model A', description: 'Single-phase 230V commercial duty' },
					{ id: `spec_std_opt2_${leadId}`, title: 'Industrial Model B', description: 'Three-phase 415V continuous duty' },
				],
			},
		];
	}

	return {
		messaging_product: 'whatsapp',
		recipient_type: 'individual',
		to: recipientPhone,
		type: 'interactive',
		interactive: {
			type: 'list',
			header: {
				type: 'text',
				text: `Select Product Specification · ${sellerCompany}`,
			},
			body: {
				text: 'Please choose your required capacity and power rating from our ready-stock catalog:',
			},
			footer: {
				text: 'Verified B2B Industrial Stock',
			},
			action: {
				button: 'View Sizing Options',
				sections,
			},
		},
	};
}
