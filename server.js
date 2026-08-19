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
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <div style="font-family: sans-serif; padding: 32px; max-width: 600px; margin: 40px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <h2 style="color: #e11d48; margin-top: 0;">Server Request Error</h2>
          <p style="color: #475569; font-size: 14px;">Next.js encountered an issue rendering this route:</p>
          <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; color: #0f172a;">${err.stack || err.message || err}</pre>
        </div>
      `);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> NestBeans Gym CRM Server ready on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
});
