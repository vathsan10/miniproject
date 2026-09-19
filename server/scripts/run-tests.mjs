// Orchestrates the test run: resets a dedicated test SQLite database,
// applies migrations to it, starts a real instance of the server against
// it, waits for it to be healthy, then runs the node:test suite against
// that live server over HTTP. Tests never touch the dev database.
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..");
const schemaPath = path.join(serverRoot, "src", "prisma", "schema.prisma");
const testDbPath = path.join(serverRoot, "src", "prisma", "test.db");
const PORT = 4100;

const env = {
  ...process.env,
  DATABASE_URL: "file:./test.db",
  JWT_SECRET: "test-secret-key-not-for-production",
  CLIENT_ORIGIN: "http://localhost:5173",
  NODE_ENV: "test",
  PORT: String(PORT),
  // Explicitly blank so tests always exercise Mock Payment mode,
  // regardless of what's configured in the developer's own .env.
  RAZORPAY_KEY_ID: "",
  RAZORPAY_KEY_SECRET: "",
};

if (existsSync(testDbPath)) unlinkSync(testDbPath);

console.log("Applying migrations to test database...");
execSync(`npx prisma migrate deploy --schema "${schemaPath}"`, {
  env,
  stdio: "inherit",
  cwd: serverRoot,
});

console.log("Starting test server on port", PORT, "...");
const server = spawn("node", ["src/index.js"], { env, cwd: serverRoot, stdio: "inherit" });

async function waitForHealth() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/health`);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await sleep(200);
  }
  throw new Error("Test server did not become healthy in time");
}

let exitCode = 1;
try {
  await waitForHealth();
  console.log("Running tests...");
  const testEnv = { ...env, TEST_BASE_URL: `http://localhost:${PORT}` };
  // Serial (concurrency=1): tests run against one shared live server, and
  // while each test's fixtures are isolated, forcing serial execution
  // keeps the whole run simple and deterministic to reason about.
  const testRun = spawn("node", ["--test", "--test-concurrency=1"], {
    env: testEnv,
    cwd: serverRoot,
    stdio: "inherit",
  });
  exitCode = await new Promise((resolve) => testRun.on("exit", (code) => resolve(code ?? 1)));
} finally {
  server.kill();
}

process.exit(exitCode);
