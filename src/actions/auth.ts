import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
	createSessionToken,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE_SECONDS,
	verifyPassword,
} from '../lib/auth';
import { getUserByEmail } from '../lib/users';

export const authActions = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			email: z.string().email(),
			password: z.string().min(1),
			remember: z.string().optional(),
		}),
		handler: async ({ email, password, remember }, context) => {
			const user = await getUserByEmail(email);
			if (!user || !verifyPassword(password, user.password_hash)) {
				throw new ActionError({ code: 'UNAUTHORIZED', message: 'Correo o contraseña incorrectos.' });
			}
			context.cookies.set(SESSION_COOKIE_NAME, createSessionToken(user.id), {
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: 'lax',
				path: '/',
				...(remember === 'on' ? { maxAge: SESSION_MAX_AGE_SECONDS } : {}),
			});
			return { success: true };
		},
	}),

	logout: defineAction({
		accept: 'form',
		handler: async (_input, context) => {
			context.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
			return { success: true };
		},
	}),
};
