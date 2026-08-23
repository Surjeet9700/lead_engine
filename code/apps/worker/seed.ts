import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DB_NAME = 'lead-state';
const args = process.argv.slice(2);
const remote = args.includes('--remote');
const local = args.includes('--local');

if (remote && local) {
	console.error('Pick one: --local or --remote');
	process.exit(1);
}

const flag = remote ? '--remote' : '--local';
console.log(`Seeding ${remote ? 'remote' : 'local'} D1 database "${DB_NAME}" from migrations/seed.sql ...`);

try {
	execSync(`bunx wrangler d1 execute ${DB_NAME} --file migrations/seed.sql ${flag}`, {
		stdio: 'inherit',
		cwd: fileURLToPath(new URL('.', import.meta.url)),
	});
	console.log('Seed complete.');
} catch {
	console.error('Seed failed.');
	process.exit(1);
}
