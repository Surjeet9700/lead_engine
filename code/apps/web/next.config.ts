import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
	output: 'export',
	outputFileTracingRoot: path.join(__dirname),
	images: { unoptimized: true },
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		cpus: 1,
	},
};

export default nextConfig;
