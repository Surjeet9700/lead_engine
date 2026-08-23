// Branded types: prevent mixing SellerId / LeadId / DedupKey at compile time.
// Runtime cost zero. Per palakorn Pattern 1 + tomodahinata §7.

declare const __brandSellerId: unique symbol;
declare const __brandLeadId: unique symbol;
declare const __brandDedupKey: unique symbol;

export type SellerId = string & { readonly [__brandSellerId]: true };
export type LeadId = string & { readonly [__brandLeadId]: true };
export type DedupKey = string & { readonly [__brandDedupKey]: true };

export function asSellerId(s: string): SellerId {
	return s as SellerId;
}
export function asLeadId(s: string): LeadId {
	return s as LeadId;
}
export function asDedupKey(s: string): DedupKey {
	return s as DedupKey;
}

/** Exhaustiveness helper: add a union variant and every switch missing it fails at compile time. */
export function assertNever(x: never): never {
	throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
