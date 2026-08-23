// Dynamic Multi-Industry Schema & Attribute Extraction Engine.
// Replaces hardcoded attributes with dynamic, configurable category schemas for any B2B domain.

export type AttributeDataType = 'number' | 'string' | 'enum' | 'boolean';

export interface DynamicAttributeDef {
	key: string; // e.g. "power", "head", "flow", "pressure", "capacity", "voltage", "material"
	label: string; // e.g. "Power Rating", "Operating Pressure"
	type: AttributeDataType;
	unit?: string; // Standard base unit e.g. "HP", "m", "LPM", "Bar", "kVA", "Liters", "DN(mm)"
	unitConversions?: { unitPattern: RegExp; multiplier: number }[];
	extractRegex?: RegExp;
	enumValues?: { value: string; label: string; pattern: RegExp }[];
	weight?: number; // Importance in matching (default 1.0)
}

export interface CatalogSkuDefinition {
	skuId: string;
	name: string;
	category: string;
	attributeRequirements: Record<
		string,
		| number
		| string
		| boolean
		| { min?: number; max?: number; allowedValues?: string[] }
	>;
	tags?: string[];
}

export interface ProductCategorySchema {
	id: string;
	name: string;
	categoryPatterns: RegExp[];
	attributes: DynamicAttributeDef[];
	standardSkus?: CatalogSkuDefinition[];
}

export interface ExtractedAttributeValue {
	key: string;
	label: string;
	rawValue: string;
	normalizedValue: number | string | boolean;
	unit?: string;
	confidence: number;
}

export interface DynamicExtractionResult {
	categoryId: string;
	categoryName: string;
	attributes: Record<string, ExtractedAttributeValue>;
	detectedKeywords: string[];
	commercialIntentScore: number; // 0 to 100
	isAcademicSpam: boolean;
	matchedSku: {
		skuId: string;
		name: string;
		confidence: number;
	} | null;
	formattedSpecSummary: string;
}

// Universal Academic Spam Detection Regex
const UNIVERSAL_ACADEMIC_SPAM_RE =
	/\b(project|college|ppt|internship|syllabus|assignment|b\.?tech|diploma|thesis|mini\s*project|student\s*project)\b/i;

// =========================================================================
// Built-in Industry Schemas
// =========================================================================

export const INDUSTRIAL_PUMPS_SCHEMA: ProductCategorySchema = {
	id: 'industrial_pumps',
	name: 'Industrial Pumps & Pumping Systems',
	categoryPatterns: [/\b(pump|pumps|submersible|multistage|monoblock|dosing|sewage|borewell|ro\s*feed|hydro\s*pneumatic)\b/i],
	attributes: [
		{
			key: 'power',
			label: 'Power Rating',
			type: 'number',
			unit: 'HP',
			unitConversions: [
				{ unitPattern: /\b(?:kw|k\.w\.|kilowatt)\b/i, multiplier: 1.341 }, // 1 kW = 1.341 HP
			],
			extractRegex: /(?:(\d+(?:\.\d+)?)\s*(?:hp|h\.p\.|horsepower|kw|k\.w\.)|(?:half|1\/2)\s*hp)/i,
		},
		{
			key: 'head',
			label: 'Total Head',
			type: 'number',
			unit: 'm',
			unitConversions: [
				{ unitPattern: /\b(?:feet|ft)\b/i, multiplier: 0.3048 }, // 1 ft = 0.3048 m
			],
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:m(?:eters?)?|mtr|head|feet|ft)\b/i,
		},
		{
			key: 'flow_rate',
			label: 'Flow Rate / Discharge',
			type: 'number',
			unit: 'LPM',
			unitConversions: [
				{ unitPattern: /\b(?:m3\/hr|cu\.?m\/hr)\b/i, multiplier: 16.667 }, // 1 m3/hr = 16.667 LPM
				{ unitPattern: /\b(?:gpm)\b/i, multiplier: 3.785 },
			],
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:lpm|l\/min|liters?\s*per\s*min|m3\/hr|gpm)\b/i,
		},
		{
			key: 'pump_type',
			label: 'Pump Construction Type',
			type: 'enum',
			enumValues: [
				{ value: 'vertical_multistage', label: 'Vertical Multistage', pattern: /\b(vertical\s*multistage|vmp|cr-?15|cr-?10|cr-?20|multistage|ro\s*feed|boiler\s*feed)\b/i },
				{ value: 'submersible_borewell', label: 'Submersible Borewell', pattern: /\b(submersible|borewell|bore\s*well|openwell|tube\s*well|4\s*inch|6\s*inch)\b/i },
				{ value: 'monoblock_centrifugal', label: 'Monoblock Centrifugal', pattern: /\b(monoblock|monobloc|centrifugal|self\s*priming|surface\s*pump)\b/i },
				{ value: 'chemical_dosing', label: 'Chemical Dosing', pattern: /\b(dosing|chemical|metering|diaphragm|acid\s*pump)\b/i },
				{ value: 'sewage_dewatering', label: 'Sewage / Dewatering', pattern: /\b(sewage|slurry|sludge|effluent|cutter|non-?clog|dewatering)\b/i },
			],
		},
		{
			key: 'electrical_phase',
			label: 'Electrical Phase',
			type: 'enum',
			enumValues: [
				{ value: 'three_phase', label: '3-Phase (415V)', pattern: /\b(3\s*phase|three\s*phase|415\s*v|440\s*v)\b/i },
				{ value: 'single_phase', label: '1-Phase (230V)', pattern: /\b(1\s*phase|single\s*phase|220\s*v|230\s*v)\b/i },
			],
		},
	],
	standardSkus: [
		{
			skuId: 'CR-15-12',
			name: '15HP High-Head Vertical Multistage Pump',
			category: 'industrial_pumps',
			attributeRequirements: { power: { min: 12, max: 18 }, pump_type: 'vertical_multistage' },
		},
		{
			skuId: 'KS4-750',
			name: '7.5HP Heavy-Duty Borewell Submersible Pump',
			category: 'industrial_pumps',
			attributeRequirements: { power: { min: 6, max: 9 }, pump_type: 'submersible_borewell' },
		},
		{
			skuId: 'MB-500',
			name: '5HP High-Flow Centrifugal Monoblock Pump',
			category: 'industrial_pumps',
			attributeRequirements: { power: { min: 4, max: 6 }, pump_type: 'monoblock_centrifugal' },
		},
	],
};

export const AIR_COMPRESSORS_SCHEMA: ProductCategorySchema = {
	id: 'air_compressors',
	name: 'Industrial Air Compressors',
	categoryPatterns: [/\b(compressor|compressors|screw\s*compressor|air\s*receiver|piston\s*compressor|pneumatic\s*compressor)\b/i],
	attributes: [
		{
			key: 'power',
			label: 'Power Rating',
			type: 'number',
			unit: 'HP',
			unitConversions: [{ unitPattern: /\b(?:kw|k\.w\.)\b/i, multiplier: 1.341 }],
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:hp|kw|horsepower)\b/i,
		},
		{
			key: 'pressure',
			label: 'Working Pressure',
			type: 'number',
			unit: 'Bar',
			unitConversions: [{ unitPattern: /\b(?:psi)\b/i, multiplier: 0.0689476 }], // 1 psi = 0.0689 bar
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:bar|psi|kg\/cm2)\b/i,
		},
		{
			key: 'airflow',
			label: 'Free Air Delivery (FAD)',
			type: 'number',
			unit: 'CFM',
			unitConversions: [{ unitPattern: /\b(?:m3\/min)\b/i, multiplier: 35.315 }],
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:cfm|m3\/min|lpm)\b/i,
		},
		{
			key: 'compressor_type',
			label: 'Compressor Technology',
			type: 'enum',
			enumValues: [
				{ value: 'rotary_screw', label: 'Rotary Screw', pattern: /\b(screw|rotary\s*screw|oil\s*injected|vfd\s*screw)\b/i },
				{ value: 'reciprocating_piston', label: 'Reciprocating Piston', pattern: /\b(piston|reciprocating|belt\s*driven)\b/i },
				{ value: 'oil_free', label: 'Oil-Free Medical/Food', pattern: /\b(oil\s*free|oil-free|dry\s*screw|medical\s*air)\b/i },
			],
		},
	],
	standardSkus: [
		{
			skuId: 'SCREW-20-10B',
			name: '20HP Rotary Screw Air Compressor (10 Bar / 85 CFM)',
			category: 'air_compressors',
			attributeRequirements: { power: { min: 18, max: 25 }, compressor_type: 'rotary_screw' },
		},
		{
			skuId: 'PISTON-10-12B',
			name: '10HP Two-Stage Reciprocating Air Compressor (12 Bar)',
			category: 'air_compressors',
			attributeRequirements: { power: { min: 7.5, max: 12 }, compressor_type: 'reciprocating_piston' },
		},
	],
};

export const DIESEL_GENERATORS_SCHEMA: ProductCategorySchema = {
	id: 'diesel_generators',
	name: 'Diesel & Gas Generators (DG Sets)',
	categoryPatterns: [/\b(generator|generators|genset|dg\s*set|diesel\s*generator|kirloskar\s*genset|cummins)\b/i],
	attributes: [
		{
			key: 'capacity_kva',
			label: 'Apparent Power',
			type: 'number',
			unit: 'kVA',
			unitConversions: [{ unitPattern: /\b(?:kw)\b/i, multiplier: 1.25 }], // PF 0.8
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:kva|k\.v\.a\.|kw|k\.w\.)\b/i,
		},
		{
			key: 'canopy_type',
			label: 'Acoustic Enclosure',
			type: 'enum',
			enumValues: [
				{ value: 'silent_canopy', label: 'Acoustic Silent CPCB-IV+', pattern: /\b(silent|acoustic|cpcb|soundproof|enclosure)\b/i },
				{ value: 'open_type', label: 'Open Frame', pattern: /\b(open\s*type|open\s*skid|unhoused)\b/i },
			],
		},
		{
			key: 'cooling_system',
			label: 'Cooling System',
			type: 'enum',
			enumValues: [
				{ value: 'water_cooled', label: 'Water Cooled Radiator', pattern: /\b(water\s*cool(?:ed|ing)?|radiator|coolant)\b/i },
				{ value: 'air_cooled', label: 'Air Cooled', pattern: /\b(air\s*cool(?:ed|ing)?)\b/i },
			],
		},
	],
	standardSkus: [
		{
			skuId: 'DG-62.5-CPCB',
			name: '62.5 kVA CPCB-IV+ Acoustic Silent Diesel Generator',
			category: 'diesel_generators',
			attributeRequirements: { capacity_kva: { min: 50, max: 75 } },
		},
		{
			skuId: 'DG-125-CPCB',
			name: '125 kVA Industrial Silent Diesel Generator',
			category: 'diesel_generators',
			attributeRequirements: { capacity_kva: { min: 100, max: 150 } },
		},
	],
};

export const GENERIC_B2B_SCHEMA: ProductCategorySchema = {
	id: 'generic_b2b',
	name: 'General B2B Industrial Goods',
	categoryPatterns: [/.*/],
	attributes: [
		{
			key: 'quantity',
			label: 'Required Quantity',
			type: 'number',
			unit: 'Units',
			extractRegex: /(\d+)\s*(?:nos|pcs|pieces|units|sets|qty|numbers)\b/i,
		},
		{
			key: 'capacity',
			label: 'Capacity / Size',
			type: 'number',
			extractRegex: /(\d+(?:\.\d+)?)\s*(?:ton|tons|ltr|liters|kg|mm|inch|inches|mtr|meters|hp|kva|kw)\b/i,
		},
	],
};

export const STANDARD_INDUSTRY_SCHEMAS: ProductCategorySchema[] = [
	INDUSTRIAL_PUMPS_SCHEMA,
	AIR_COMPRESSORS_SCHEMA,
	DIESEL_GENERATORS_SCHEMA,
	GENERIC_B2B_SCHEMA,
];

// =========================================================================
// Universal Dynamic Attribute Extractor
// =========================================================================

export function detectCategorySchema(
	text: string,
	customSchemas: ProductCategorySchema[] = [],
): ProductCategorySchema {
	const allSchemas = [...customSchemas, ...STANDARD_INDUSTRY_SCHEMAS];
	for (const schema of allSchemas) {
		if (schema.id === 'generic_b2b') continue;
		for (const pattern of schema.categoryPatterns) {
			if (pattern.test(text)) {
				return schema;
			}
		}
	}
	return GENERIC_B2B_SCHEMA;
}

export function extractDynamicAttributes(
	rawText: string,
	productName = '',
	customSchema?: ProductCategorySchema,
): DynamicExtractionResult {
	const combined = `${productName} ${rawText}`.trim();
	const keywords: string[] = [];

	// 1. Check for Academic / Non-commercial spam
	const isAcademicSpam = UNIVERSAL_ACADEMIC_SPAM_RE.test(combined);
	if (isAcademicSpam) {
		keywords.push('academic_spam');
	}

	// 2. Select appropriate category schema
	const schema = customSchema ?? detectCategorySchema(combined);

	// 3. Extract dynamic attributes defined in the schema
	const extractedAttributes: Record<string, ExtractedAttributeValue> = {};

	for (const attr of schema.attributes) {
		if (attr.type === 'number' && attr.extractRegex) {
			// Special handling for fractional values (e.g., "half hp", "1/2 hp")
			let numValue: number | null = null;
			let rawStr = '';

			if (attr.key === 'power' && /\b(half|1\/2)\s*hp\b/i.test(combined)) {
				numValue = 0.5;
				rawStr = '0.5 HP';
			} else {
				const match = combined.match(attr.extractRegex);
				if (match && match[1]) {
					rawStr = match[0];
					let val = parseFloat(match[1]);

					// Handle unit conversions
					if (attr.unitConversions) {
						for (const conv of attr.unitConversions) {
							if (conv.unitPattern.test(rawStr)) {
								val = Math.round(val * conv.multiplier * 100) / 100;
								break;
							}
						}
					}
					numValue = val;
				}
			}

			if (numValue !== null) {
				extractedAttributes[attr.key] = {
					key: attr.key,
					label: attr.label,
					rawValue: rawStr,
					normalizedValue: numValue,
					confidence: 0.9,
					...(attr.unit ? { unit: attr.unit } : {}),
				};
				keywords.push(`${numValue}${attr.unit ?? ''}`);
			}
		} else if (attr.type === 'enum' && attr.enumValues) {
			for (const enumOption of attr.enumValues) {
				if (enumOption.pattern.test(combined)) {
					extractedAttributes[attr.key] = {
						key: attr.key,
						label: attr.label,
						rawValue: enumOption.label,
						normalizedValue: enumOption.value,
						confidence: 0.95,
					};
					keywords.push(enumOption.value);
					break;
				}
			}
		}
	}

	// 4. Calculate Commercial Intent Score
	let intentScore = 50;
	if (isAcademicSpam) {
		intentScore = 0;
	} else {
		const extractedCount = Object.keys(extractedAttributes).length;
		intentScore += extractedCount * 15;

		if (/\b(urgent|immediate|required|purchase|tender|quote|price|rate|order)\b/i.test(combined)) {
			intentScore += 15;
		}
		if (combined.length > 40) {
			intentScore += 5;
		}
	}
	intentScore = Math.min(100, Math.max(0, intentScore));

	// 5. Match against Catalog SKUs dynamically
	let matchedSku: DynamicExtractionResult['matchedSku'] = null;
	const skus = schema.standardSkus ?? [];

	let bestScore = 0;
	for (const sku of skus) {
		let matchCount = 0;
		let totalRequirements = 0;

		for (const [attrKey, req] of Object.entries(sku.attributeRequirements)) {
			totalRequirements++;
			const extracted = extractedAttributes[attrKey];
			if (!extracted) continue;

			if (typeof req === 'object' && 'min' in req && typeof extracted.normalizedValue === 'number') {
				const min = req.min ?? -Infinity;
				const max = req.max ?? Infinity;
				if (extracted.normalizedValue >= min && extracted.normalizedValue <= max) {
					matchCount++;
				}
			} else if (extracted.normalizedValue === req) {
				matchCount++;
			}
		}

		const matchScore = totalRequirements > 0 ? matchCount / totalRequirements : 0;
		if (matchScore > bestScore && matchScore >= 0.5) {
			bestScore = matchScore;
			matchedSku = {
				skuId: sku.skuId,
				name: sku.name,
				confidence: Math.round(matchScore * 100) / 100,
			};
		}
	}

	// 6. Format dynamic summary
	const attributeSummaryParts = Object.values(extractedAttributes).map((a) => `${a.normalizedValue}${a.unit ?? ''}`);
	const summaryStr = isAcademicSpam
		? 'Non-commercial academic inquiry flagged for dispute refund.'
		: attributeSummaryParts.length > 0
			? `${attributeSummaryParts.join(' · ')} (${schema.name}) · Intent: ${intentScore}/100`
			: `${schema.name} Enquiry · Intent: ${intentScore}/100`;

	return {
		categoryId: schema.id,
		categoryName: schema.name,
		attributes: extractedAttributes,
		detectedKeywords: keywords,
		commercialIntentScore: intentScore,
		isAcademicSpam,
		matchedSku,
		formattedSpecSummary: summaryStr,
	};
}
