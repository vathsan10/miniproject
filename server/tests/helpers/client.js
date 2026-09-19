const BASE = process.env.TEST_BASE_URL || "http://localhost:4100";

function extractCookie(res) {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  return setCookie.split(";")[0]; // "unipay_token=..."
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`login failed for ${email}: ${res.status}`);
  }
  return { cookie: extractCookie(res) };
}

export async function apiFetch(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}
