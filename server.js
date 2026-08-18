// Custom production server.js entry point for cPanel / Aquahost Node.js App Runner
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// Initialize Next.js app for cPanel Passenger
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> NestBeans Gym CRM Server ready on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
});
