import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';
import { getUserById } from './lib/users';

export const onRequest = defineMiddleware(async (context, next) => {
	const { cookies, url, request, redirect } = context;

	// CSRF: cualquier POST debe venir del mismo origin (formularios/actions propios).
	if (request.method === 'POST') {
		const origin = request.headers.get('origin');
		if (origin && origin !== url.origin) {
			return new Response('Origin no permitido', { status: 403 });
		}
	}

	const token = cookies.get(SESSION_COOKIE_NAME)?.value;
	const userId = verifySessionToken(token);
	const user = userId ? await getUserById(userId) : null;
	context.locals.user = user ? { id: user.id, email: user.email } : null;

	const isAdminRoute = url.pathname.startsWith('/admin');
	const isLoginRoute = url.pathname === '/admin/login';

	if (isAdminRoute && !isLoginRoute && !context.locals.user) {
		return redirect('/admin/login');
	}
	if (isLoginRoute && context.locals.user) {
		return redirect('/admin');
	}

	return next();
});
