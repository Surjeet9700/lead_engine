import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'out');
const PORT = process.env.PORT || 3000;

const MIME = {
	'.html': 'text/html; charset=UTF-8',
	'.js': 'application/javascript; charset=UTF-8',
	'.css': 'text/css; charset=UTF-8',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
	let reqPath = req.url.split('?')[0];
	if (reqPath === '/') reqPath = '/index.html';

	let filePath = path.join(outDir, reqPath);

	try {
		const stat = fs.statSync(filePath, { throwIfNoEntry: false });
		if (!stat || stat.isDirectory()) {
			if (fs.existsSync(filePath + '.html')) {
				filePath = filePath + '.html';
			} else if (fs.existsSync(path.join(filePath, 'index.html'))) {
				filePath = path.join(filePath, 'index.html');
			} else {
				filePath = path.join(outDir, 'index.html');
			}
		}
	} catch {
		filePath = path.join(outDir, 'index.html');
	}

	const ext = path.extname(filePath);
	const contentType = MIME[ext] || 'application/octet-stream';

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('404 Not Found');
			return;
		}
		res.writeHead(200, { 'Content-Type': contentType });
		res.end(data);
	});
});

server.listen(PORT, '0.0.0.0', () => {
	console.log(`LeadSpeed CRM Server listening at http://localhost:${PORT}`);
});
