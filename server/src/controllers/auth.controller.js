import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { COOKIE_NAME } from "../middleware/auth.js";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

// A precomputed hash of a value nobody will ever type, used to keep the
// bcrypt.compare timing the same whether or not the email exists - so a
// login attempt can't be used to enumerate registered emails.
const DUMMY_HASH = bcrypt.hashSync("unipay-dummy-password", 10);

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

function issueSession(res, user) {
  const token = signToken({ id: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

// Students only - vendor accounts are created by an admin (Phase 8).
export async function register(req, res) {
  const { name, email, rollNo, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, rollNo, passwordHash, role: "STUDENT" },
  });

  issueSession(res, user);
  res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic message for "no such user" and "wrong password", and a
  // bcrypt.compare call runs either way, so this endpoint can't be used
  // to check which emails have accounts (by response content or timing).
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  issueSession(res, user);
  res.json({ user: toPublicUser(user) });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ ok: true });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: toPublicUser(user) });
}
