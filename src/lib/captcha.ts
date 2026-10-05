import { env } from './env';

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
	if (!token) return false;
	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: new URLSearchParams({
				secret: env.TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: ip,
			}),
		});
		const data = (await res.json()) as { success: boolean };
		return Boolean(data.success);
	} catch (error) {
		console.error('Error al verificar Turnstile:', error);
		return false;
	}
}
