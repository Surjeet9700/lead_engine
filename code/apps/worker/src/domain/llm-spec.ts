// Dynamic Specification Extraction & Qualification Engine.
// Powered by the Schema Engine for dynamic, multi-category attribute extraction.

import {
	extractDynamicAttributes,
	type DynamicExtractionResult,
	type ProductCategorySchema,
	INDUSTRIAL_PUMPS_SCHEMA,
} from './schema-engine';

export type PumpType =
	| 'vertical_multistage'
	| 'submersible_borewell'
	| 'monoblock_centrifugal'
	| 'chemical_dosing'
	| 'sewage_dewatering'
	| 'solar_submersible'
	| 'general_industrial';

export type ElectricalPhase = 'single_phase' | 'three_phase' | 'unknown';

export interface ExtractedPumpSpec {
	powerHp: number | null;
	powerKw: number | null;
	headMeters: number | null;
	flowLpm: number | null;
	pumpType: PumpType;
	phase: ElectricalPhase;
	voltage: number | null;
	commercialIntentScore: number;
	isAcademicSpam: boolean;
	matchedCatalogSku: string | null;
	confidence: number;
	summary: string;
	detectedKeywords: string[];
	dynamicResult: DynamicExtractionResult;
}

export function extractPumpSpecs(
	rawText: string,
	productName = '',
	customSchema?: ProductCategorySchema,
): ExtractedPumpSpec {
	const dynamicResult = extractDynamicAttributes(rawText, productName, customSchema ?? INDUSTRIAL_PUMPS_SCHEMA);

	const powerAttr = dynamicResult.attributes['power'];
	const headAttr = dynamicResult.attributes['head'];
	const flowAttr = dynamicResult.attributes['flow_rate'];
	const typeAttr = dynamicResult.attributes['pump_type'];
	const phaseAttr = dynamicResult.attributes['electrical_phase'];

	const powerHp = typeof powerAttr?.normalizedValue === 'number' ? powerAttr.normalizedValue : null;
	const powerKw = powerHp !== null ? Math.round(powerHp * 0.7457 * 100) / 100 : null;
	const headMeters = typeof headAttr?.normalizedValue === 'number' ? headAttr.normalizedValue : null;
	const flowLpm = typeof flowAttr?.normalizedValue === 'number' ? flowAttr.normalizedValue : null;

	const pumpType = (typeAttr?.normalizedValue as PumpType) || 'general_industrial';
	const phase = (phaseAttr?.normalizedValue as ElectricalPhase) || (powerHp && powerHp >= 5 ? 'three_phase' : 'unknown');
	const voltage = phase === 'three_phase' ? 415 : phase === 'single_phase' ? 230 : null;

	return {
		powerHp,
		powerKw,
		headMeters,
		flowLpm,
		pumpType,
		phase,
		voltage,
		commercialIntentScore: dynamicResult.commercialIntentScore,
		isAcademicSpam: dynamicResult.isAcademicSpam,
		matchedCatalogSku: dynamicResult.matchedSku?.name ?? null,
		confidence: dynamicResult.matchedSku?.confidence ?? (dynamicResult.isAcademicSpam ? 0.95 : 0.8),
		summary: dynamicResult.formattedSpecSummary,
		detectedKeywords: dynamicResult.detectedKeywords,
		dynamicResult,
	};
}
