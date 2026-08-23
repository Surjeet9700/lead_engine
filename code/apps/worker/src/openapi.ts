// OpenAPI 3.0 spec for the Worker HTTP surface. Served at /openapi.json, rendered by Scalar at /docs.

export const openApiSpec = {
	openapi: '3.0.3',
	info: {
		title: 'IndiaMart Lead Speed Engine API',
		version: '0.1.0',
		description:
			'Ingests IndiaMart Push enquiries, scores and routes them to WhatsApp, and exposes dashboard data per seller.',
	},
	servers: [{ url: '/', description: 'Current deployment' }],
	paths: {
		'/webhook/{sellerId}': {
			post: {
				summary: 'IndiaMart Push webhook receiver',
				description:
					'Receives raw IndiaMart Push enquiry payloads. Authenticates via a per-seller token query param; valid leads are deduplicated and enqueued for scoring and WhatsApp dispatch.',
				operationId: 'ingestLead',
				parameters: [
					{
						name: 'sellerId',
						in: 'path',
						required: true,
						schema: { type: 'string' },
						example: 'seller_bj01',
					},
					{
						name: 'token',
						in: 'query',
						required: true,
						schema: { type: 'string' },
						description: 'Per-seller shared secret compared against configured seller tokens.',
						example: 'tok_xxx',
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { type: 'object' },
							description: 'Raw IndiaMart Push enquiry payload (passed through unmodified).',
						},
					},
				},
				responses: {
					'200': {
						description: 'Lead accepted',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										disposition: { type: 'string', example: 'accepted' },
									},
								},
							},
						},
					},
					'400': { description: 'Rejected — malformed payload' },
					'401': { description: 'Rejected — unknown seller or bad token' },
					'500': { description: 'Transient failure; IndiaMart should retry (body: RETRY)' },
				},
			},
		},
		'/healthz': {
			get: {
				summary: 'Health check',
				operationId: 'getHealthz',
				responses: {
					'200': {
						description: 'Worker is up',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: { type: 'string', example: 'ok' },
										ts: { type: 'string', format: 'date-time' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/api/leads/{sellerId}': {
			get: {
				summary: 'Get leads for seller',
				description: 'Returns the most recent lead states for a seller, newest first.',
				operationId: 'listLeads',
				parameters: [
					{
						name: 'sellerId',
						in: 'path',
						required: true,
						schema: { type: 'string' },
						example: 'seller_bj01',
					},
					{
						name: 'limit',
						in: 'query',
						required: false,
						schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
						description: 'Maximum number of leads to return (capped at 100).',
					},
				],
				responses: {
					'200': {
						description: 'Leads list',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										total: { type: 'integer' },
										leads: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													dedupKey: { type: 'string' },
													leadId: { type: 'string' },
													sellerId: { type: 'string' },
													product: { type: 'string' },
													city: { type: 'string' },
													priority: { type: 'number' },
													route: { type: 'string', example: 'wa_now' },
													outcome: { type: 'string' },
													attempts: { type: 'integer' },
													refundDraftFiled: { type: 'boolean' },
													lastErrorCode: { type: 'string', nullable: true },
													createdAtMs: { type: 'integer', format: 'int64' },
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		'/api/stats/{sellerId}': {
			get: {
				summary: 'Get dashboard stats for seller',
				description: 'Aggregated counts over all lead states for a seller.',
				operationId: 'getStats',
				parameters: [
					{
						name: 'sellerId',
						in: 'path',
						required: true,
						schema: { type: 'string' },
						example: 'seller_bj01',
					},
				],
				responses: {
					'200': {
						description: 'Dashboard stats',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										totalLeads: { type: 'integer' },
										hotLeads: { type: 'integer' },
										spamLeads: { type: 'integer' },
										recoveredInr: { type: 'integer' },
									},
								},
							},
						},
					},
				},
			},
		},
	},
} as const;
