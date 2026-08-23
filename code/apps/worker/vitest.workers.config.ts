// Integration test config: real D1 via vitest-pool-workers.
// fileParallelism: false — known workerd hang bug (#14903).
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: './wrangler.jsonc' },
			miniflareOptions: { compatibilityFlags: ['nodejs_compat'] },
		}),
	],
	test: {
		fileParallelism: false,
		include: ['test/integration/**/*.test.ts'],
		setupFiles: ['./test/integration/setup.ts'],
	},
});
