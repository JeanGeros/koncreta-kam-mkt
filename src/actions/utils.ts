import { ActionError } from 'astro:actions';

export function requireUser(locals: App.Locals): void {
	if (!locals.user) {
		throw new ActionError({ code: 'UNAUTHORIZED', message: 'Debes iniciar sesión.' });
	}
}

export function linesToBullets(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}
