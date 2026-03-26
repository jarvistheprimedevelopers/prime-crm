// ── Custom Google OAuth — built on google-auth-library (already installed) ──
// No next-auth needed.  Uses HMAC-SHA256 signed cookies for sessions.

import { OAuth2Client } from 'google-auth-library';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// ── OAuth2 client ─────────────────────────────────────────────────────────────
function makeOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/callback`,
  );
}

export function getGoogleAuthUrl(): string {
  return makeOAuthClient().generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
}

export async function exchangeCode(
  code: string,
): Promise<{ email: string; name: string }> {
  const client = makeOAuthClient();
  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload()!;
  return { email: payload.email!, name: payload.name ?? payload.email! };
}

// ── Session token ─────────────────────────────────────────────────────────────
export interface SessionPayload {
  email: string;
  name:  string;
  role:  'admin' | 'tech';
  exp:   number;
}

const SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production';
const COOKIE  = 'prime-session';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(data: Omit<SessionPayload, 'exp'>): string {
  const payload: SessionPayload = {
    ...data,
    exp: Date.now() + MAX_AGE * 1000,
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${b64}.${sign(b64)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [b64, sig] = token.split('.');
    if (!b64 || !sig) return null;

    const expected = sign(b64);
    // Timing-safe comparison
    const sigBuf  = Buffer.from(sig,      'base64url');
    const expBuf  = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const data = JSON.parse(Buffer.from(b64, 'base64url').toString()) as SessionPayload;
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Role helper ───────────────────────────────────────────────────────────────
export function emailToRole(email: string): 'admin' | 'tech' {
  return email.endsWith('@theprimedevelopers.com') ? 'admin' : 'tech';
}

// ── Server-side session helpers ───────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw   = store.get(COOKIE)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   MAX_AGE,
    path:     '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

// ── Lightweight token decoder for middleware (no crypto) ──────────────────────
// Middleware runs in Edge — just decode the base64 payload without verifying.
// Verification happens server-side.  This is only used for routing decisions.
export function decodeTokenUnsafe(token: string): SessionPayload | null {
  try {
    const [b64] = token.split('.');
    return JSON.parse(Buffer.from(b64, 'base64url').toString()) as SessionPayload;
  } catch {
    return null;
  }
}
