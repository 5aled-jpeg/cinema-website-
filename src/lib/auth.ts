// Cryptographically secure authentication & session management

const DEFAULT_SECRET = 'cenima_secret_vault_hmac_key_9876543210_sec';
export const ADMIN_COOKIE_NAME = 'cinema_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// In-memory rate limiting for login attempts
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);
  if (!entry) return false;

  if (now - entry.firstAttempt > LOCKOUT_WINDOW) {
    loginAttempts.delete(identifier);
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(identifier: string): number {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry || now - entry.firstAttempt > LOCKOUT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now });
    return MAX_ATTEMPTS - 1;
  }

  entry.count += 1;
  loginAttempts.set(identifier, entry);
  return Math.max(0, MAX_ATTEMPTS - entry.count);
}

export function recordSuccessfulLogin(identifier: string): void {
  loginAttempts.delete(identifier);
}

export function checkAdminPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'CenimaMaster2026!';
  if (!provided || typeof provided !== 'string') return false;

  // Constant-time length and character check
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminSessionToken(): Promise<string> {
  const key = await getHmacKey();
  const encoder = new TextEncoder();
  const timestamp = Date.now().toString();
  const payload = `cinema_admin_v1:${timestamp}`;
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${timestamp}.${signatureHex}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signatureHex] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  const ageMs = Date.now() - timestamp;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE * 1000) {
    return false;
  }

  try {
    const key = await getHmacKey();
    const encoder = new TextEncoder();
    const payload = `cinema_admin_v1:${timestampStr}`;
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return false;
    const signatureBytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

    return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}
