import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
};

// Get port from environment variable, command line argument, or use 3001 as default
const port = process.env.PORT || parseInt(process.argv[2]) || 3001;

const server = createServer(async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        
        // Set CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle OPTIONS request for CORS preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        
        // Default to index.html for root path
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = join(__dirname, filePath);
        const ext = filePath.match(/\.[^.]*$/)?.[0] || '';
        
        const content = await readFile(fullPath);
        res.writeHead(200, { 
            'Content-Type': MIME_TYPES[ext] || 'text/plain',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=86400'
        });
        res.end(content);
    } catch (err) {
        console.error(`Error serving ${req.url}: ${err.message}`);
        
        if (err.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    }
});

// Error handling for port conflicts
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
        console.error(`Try running on a different port: node server.js ${port + 1}`);
        console.error('\nOr find and stop the process using the port:');
        console.error('macOS/Linux: lsof -i :' + port + ' | grep LISTEN');
        console.error('Windows: netstat -ano | findstr :' + port);
        process.exit(1);
    } else {
        console.error(e);
        process.exit(1);
    }
});

// Start server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Test page available at http://localhost:${port}/tests/browser-format-test.html`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
}); 