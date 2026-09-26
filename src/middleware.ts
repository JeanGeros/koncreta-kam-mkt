import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';
import { getUserById } from './lib/users';

const MAINTENANCE_HTML = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Sitio en mantenimiento</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{font:1.1rem/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;text-align:center;color:#222}</style>
</head><body>
<h1>Estamos en mantenimiento</h1>
<p>Volvemos pronto. Gracias por tu paciencia.</p>
</body></html>`;

export const onRequest = defineMiddleware(async (context, next) => {
	// ponytail: gate global, togglear MAINTENANCE_MODE=true en Vercel y redeployar.
	// /admin queda afuera para poder seguir trabajando durante la migración.
	if (process.env.MAINTENANCE_MODE === 'true' && !context.url.pathname.startsWith('/admin')) {
		return new Response(MAINTENANCE_HTML, {
			status: 503,
			headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' },
		});
	}

	// Páginas estáticas (marketing) no necesitan sesión ni tocan la DB.
	if (context.isPrerendered) {
		context.locals.user = null;
		return next();
	}

	// ponytail: bypass de login SOLO en `astro dev` local, para revisar el
	// diseño del panel sin tener la DB configurada. import.meta.env.DEV es
	// falso en cualquier build de producción, así que esto nunca llega a Vercel.
	// Quitar este bloque cuando se pruebe el login real.
	if (import.meta.env.DEV && import.meta.env.ADMIN_DEV_BYPASS === 'true') {
		context.locals.user = { id: 0, email: 'dev@local' };
		return next();
	}

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
