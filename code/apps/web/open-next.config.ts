import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
	// No R2 incremental cache for MVP — direct serve
	incrementalCache: undefined,
});
