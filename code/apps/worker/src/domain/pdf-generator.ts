// Pure Edge-compatible PDF-1.4 Generator for B2B Quotations and Technical Datasheets.
// Runs natively in Cloudflare Workers and Bun with ZERO external native dependencies.

export interface QuotationData {
	quotationNumber: string;
	date: string;
	seller: {
		companyName: string;
		gstin: string;
		address: string;
		phone: string;
		email: string;
	};
	buyer: {
		name: string;
		city: string;
		phone: string;
		leadId: string;
	};
	item: {
		productName: string;
		sku: string;
		specs: {
			powerHp?: number;
			headMeters?: number;
			flowLpm?: number;
			pressureBar?: number;
			capacityKva?: number;
			phase?: string;
			cooling?: string;
		};
		qty: number;
		unitPriceInr: number;
		warranty: string;
		deliveryDays: number;
	};
	bankDetails?: {
		accountName: string;
		bankName: string;
		accountNumber: string;
		ifsc: string;
		upiId: string;
	};
}

/**
 * Escapes characters for PDF literal text strings: \(, \), \\.
 */
function escapePdfText(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Generates a standard PDF-1.4 binary document stream containing the formatted quotation.
 */
export function generateQuotationPdf(data: QuotationData): Uint8Array {
	const subtotal = data.item.qty * data.item.unitPriceInr;
	const gstAmount = Math.round(subtotal * 0.18);
	const grandTotal = subtotal + gstAmount;

	// Build spec summary lines
	const specLines: string[] = [];
	if (data.item.specs.powerHp) specLines.push(`Rated Power: ${data.item.specs.powerHp} HP`);
	if (data.item.specs.headMeters) specLines.push(`Total Dynamic Head: ${data.item.specs.headMeters} Meters`);
	if (data.item.specs.flowLpm) specLines.push(`Discharge Flow Rate: ${data.item.specs.flowLpm} LPM`);
	if (data.item.specs.pressureBar) specLines.push(`Working Pressure: ${data.item.specs.pressureBar} Bar`);
	if (data.item.specs.capacityKva) specLines.push(`Electrical Rating: ${data.item.specs.capacityKva} kVA`);
	if (data.item.specs.phase) specLines.push(`Power Supply: ${data.item.specs.phase}`);
	if (data.item.specs.cooling) specLines.push(`Cooling Type: ${data.item.specs.cooling}`);

	// Construct PDF Content Stream Instructions (PostScript-like)
	const streamCommands: string[] = [];

	// Background & Header Banner
	streamCommands.push(
		'0.08 0.12 0.20 rg', // Dark Navy banner
		'0 740 595 102 re f', // Fill top rectangle
		'1 1 1 rg', // White text
		'BT',
		'/F2 20 Tf',
		'40 795 Td',
		`(${escapePdfText(data.seller.companyName)}) Tj`,
		'/F1 9 Tf',
		'0 -16 Td',
		`(${escapePdfText(`GSTIN: ${data.seller.gstin} | ${data.seller.address} | Ph: ${data.seller.phone}`)}) Tj`,
		'ET',
	);

	// Quotation Title & Meta Box
	streamCommands.push(
		'0.95 0.96 0.98 rg',
		'40 680 515 45 re f',
		'0.8 0.85 0.90 RG',
		'0.5 w',
		'40 680 515 45 re S',
		'0.1 0.15 0.25 rg',
		'BT',
		'/F2 13 Tf',
		'55 704 Td',
		`(OFFICIAL COMMERCIAL QUOTATION) Tj`,
		'/F1 9 Tf',
		'0 -14 Td',
		`(${escapePdfText(`Quote Ref: ${data.quotationNumber} | Date: ${data.date} | Lead ID: ${data.buyer.leadId}`)}) Tj`,
		'ET',
	);

	// Buyer Information Box
	streamCommands.push(
		'0.98 0.98 0.98 rg',
		'40 590 515 75 re f',
		'0.85 0.85 0.85 RG',
		'40 590 515 75 re S',
		'0.1 0.1 0.1 rg',
		'BT',
		'/F2 10 Tf',
		'55 645 Td',
		`(BUYER / CONSIGNEE DETAILS) Tj`,
		'/F1 9 Tf',
		'0 -14 Td',
		`(${escapePdfText(`Buyer Name: ${data.buyer.name}`)}) Tj`,
		'0 -12 Td',
		`(${escapePdfText(`Destination: ${data.buyer.city} | Mobile: ${data.buyer.phone}`)}) Tj`,
		'0 -12 Td',
		`(${escapePdfText(`Inquiry Origin: IndiaMart Verified Buyer Network`)}) Tj`,
		'ET',
	);

	// Line Item Table Header
	streamCommands.push(
		'0.15 0.25 0.40 rg',
		'40 550 515 24 re f',
		'1 1 1 rg',
		'BT',
		'/F2 9 Tf',
		'50 558 Td',
		`(Item Description & Technical Specifications) Tj`,
		'270 0 Td',
		`(SKU / Model) Tj`,
		'75 0 Td',
		`(Qty) Tj`,
		'45 0 Td',
		`(Unit Price) Tj`,
		'55 0 Td',
		`(Total (INR)) Tj`,
		'ET',
	);

	// Line Item Body Box
	streamCommands.push(
		'1 1 1 rg',
		'40 370 515 180 re f',
		'0.85 0.85 0.85 RG',
		'40 370 515 180 re S',
		'0.1 0.1 0.1 rg',
		'BT',
		'/F2 10 Tf',
		'50 530 Td',
		`(${escapePdfText(data.item.productName)}) Tj`,
		'/F1 8.5 Tf',
	);

	// Spec bullet points
	let currentY = 530;
	for (const s of specLines) {
		currentY -= 14;
		streamCommands.push(`0 -14 Td (${escapePdfText(`• ${s}`)}) Tj`);
	}

	// Warranty and dispatch info
	streamCommands.push(
		`0 -14 Td (${escapePdfText(`• Standard Warranty: ${data.item.warranty}`)}) Tj`,
		`0 -14 Td (${escapePdfText(`• Delivery Dispatch SLA: Ready in ${data.item.deliveryDays} business days`)}) Tj`,
		'ET',
	);

	// Quantity and Price columns
	streamCommands.push(
		'0.1 0.1 0.1 rg',
		'BT',
		'/F1 9 Tf',
		'320 530 Td',
		`(${escapePdfText(data.item.sku)}) Tj`,
		'75 0 Td',
		`(${data.item.qty} Nos) Tj`,
		'45 0 Td',
		`(${escapePdfText(`Rs. ${data.item.unitPriceInr.toLocaleString('en-IN')}`)}) Tj`,
		'55 0 Td',
		`(${escapePdfText(`Rs. ${subtotal.toLocaleString('en-IN')}`)}) Tj`,
		'ET',
	);

	// Price Breakdown & Total Box
	streamCommands.push(
		'0.96 0.98 0.96 rg',
		'310 270 245 85 re f',
		'0.75 0.85 0.75 RG',
		'310 270 245 85 re S',
		'0.15 0.20 0.15 rg',
		'BT',
		'/F1 9 Tf',
		'325 332 Td',
		`(${escapePdfText(`Subtotal: Rs. ${subtotal.toLocaleString('en-IN')}`)}) Tj`,
		'0 -15 Td',
		`(${escapePdfText(`GST @ 18% (HSN 8413): Rs. ${gstAmount.toLocaleString('en-IN')}`)}) Tj`,
		'/F2 11 Tf',
		'0.05 0.45 0.15 rg',
		'0 -18 Td',
		`(${escapePdfText(`GRAND TOTAL: Rs. ${grandTotal.toLocaleString('en-IN')}`)}) Tj`,
		'ET',
	);

	// Payment & Terms Box
	streamCommands.push(
		'0.98 0.98 0.98 rg',
		'40 270 255 85 re f',
		'0.85 0.85 0.85 RG',
		'40 270 255 85 re S',
		'0.1 0.1 0.1 rg',
		'BT',
		'/F2 9 Tf',
		'50 335 Td',
		`(BANK TRANSFER & UPI PAYMENT) Tj`,
		'/F1 8 Tf',
		'0 -14 Td',
		`(${escapePdfText(`Account Name: ${data.bankDetails?.accountName || data.seller.companyName}`)}) Tj`,
		'0 -11 Td',
		`(${escapePdfText(`Bank: ${data.bankDetails?.bankName || 'HDFC Bank Ltd, Industrial Finance Branch'}`)}) Tj`,
		'0 -11 Td',
		`(${escapePdfText(`A/C: ${data.bankDetails?.accountNumber || '50200084729103'} | IFSC: ${data.bankDetails?.ifsc || 'HDFC0001234'}`)}) Tj`,
		'0 -11 Td',
		`(${escapePdfText(`UPI VPA: ${data.bankDetails?.upiId || 'bharatpumps@hdfcbank'}`)}) Tj`,
		'ET',
	);

	// Footer Stamp & Validity
	streamCommands.push(
		'0.5 0.5 0.5 rg',
		'BT',
		'/F1 8 Tf',
		'40 60 Td',
		`(Terms & Conditions: Quotation valid for 14 days. 100% advance or approved credit terms before dispatch.) Tj`,
		'0 -11 Td',
		`(Generated autonomously via IndiaMart Lead Speed Engine. Computer generated document, no physical signature required.) Tj`,
		'ET',
	);

	const contentStream = streamCommands.join('\n');
	const streamLength = contentStream.length;

	// Assemble PDF Objects
	const objects: string[] = [
		// Obj 1: Catalog
		'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
		// Obj 2: Pages
		'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
		// Obj 3: Page (A4 Portrait: 595 x 842 pt)
		'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj',
		// Obj 4: Content Stream
		`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
		// Obj 5: Font Regular (Helvetica)
		'5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
		// Obj 6: Font Bold (Helvetica-Bold)
		'6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
	];

	// Build xref table
	let offset = 9; // "%PDF-1.4\n" length
	const xrefEntries: string[] = ['0000000000 65535 f '];
	const pdfBodyChunks: string[] = ['%PDF-1.4\n'];

	for (let i = 0; i < objects.length; i++) {
		const objStr = `${objects[i]}\n`;
		xrefEntries.push(`${String(offset).padStart(10, '0')} 00000 n `);
		pdfBodyChunks.push(objStr);
		offset += objStr.length;
	}

	const xrefOffset = offset;
	const xrefTable = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('\n')}\n`;
	const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

	const finalPdfString = `${pdfBodyChunks.join('')}${xrefTable}${trailer}`;
	return new TextEncoder().encode(finalPdfString);
}
