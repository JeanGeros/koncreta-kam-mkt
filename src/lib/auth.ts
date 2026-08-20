import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	const [salt, hash] = stored.split(':');
	if (!salt || !hash) return false;
	const candidate = scryptSync(password, salt, 64);
	const expected = Buffer.from(hash, 'hex');
	return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function sign(payload: string): string {
	return createHmac('sha256', import.meta.env.SESSION_SECRET).update(payload).digest('hex');
}

export function createSessionToken(userId: number): string {
	const payload = `${userId}.${Date.now() + SESSION_TTL_MS}`;
	return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
	if (!token) return null;
	const [userId, expiry, signature] = token.split('.');
	if (!userId || !expiry || !signature) return null;
	const payload = `${userId}.${expiry}`;
	const expected = Buffer.from(sign(payload), 'hex');
	const actual = Buffer.from(signature, 'hex');
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
	if (Date.now() > Number(expiry)) return null;
	return Number(userId);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
