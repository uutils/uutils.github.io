#!/usr/bin/env node
/**
 * Run the wasm-terminal unit tests headlessly using Puppeteer.
 *
 * Usage:
 *   npm install puppeteer   # one-time setup
 *   node scripts/run-tests.js [--port 8080] [--dir public]
 *
 * The script starts a local HTTP server, opens the test page in headless
 * Chrome, waits for the results, and exits with code 1 on failure.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Parse CLI args
const args = process.argv.slice(2);
let port = 8080;
let dir = "public";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) port = parseInt(args[++i]);
  if (args[i] === "--dir" && args[i + 1]) dir = args[++i];
}

// Resolve serve directory — fall back to static/ if public/ doesn't exist
// (public/ is the zola build output; static/ works for running without a build)
const serveDir = fs.existsSync(path.resolve(dir))
  ? path.resolve(dir)
  : path.resolve("static");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = req.url.split("?")[0];
      let filePath = path.join(serveDir, url === "/" ? "index.html" : url);

      // Prevent path traversal outside the serve directory
      if (!path.resolve(filePath).startsWith(serveDir + path.sep) && path.resolve(filePath) !== serveDir) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": mime });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, "127.0.0.1", () => {
      console.log(`Serving ${serveDir} on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function runTests(server) {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("Puppeteer not found. Install it with: npm install puppeteer");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.on("console", (msg) => console.log("BROWSER:", msg.text()));
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));

  const testUrl = `http://127.0.0.1:${port}/js/wasm-terminal.test.html`;
  console.log(`Opening ${testUrl}`);

  await page.goto(testUrl, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction("window.__testsFailed !== undefined", {
    timeout: 30000,
  });

  const failed = await page.evaluate(() => window.__testsFailed);
  const passed = await page.evaluate(() => window.__testsPassed);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  await browser.close();
  server.close();

  process.exit(failed > 0 ? 1 : 0);
}

(async () => {
  const server = await startServer();
  await runTests(server);
})();
