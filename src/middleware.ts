import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';
import { env } from './lib/env';

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
	// Gate global para mantenciones
	if (env.MAINTENANCE_MODE && !context.url.pathname.startsWith('/admin')) {
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

	// Bypass de dev local opcional
	if (import.meta.env.DEV && import.meta.env.ADMIN_DEV_BYPASS === 'true') {
		context.locals.user = { id: 'dev-user-id', email: 'dev@local' };
		return next();
	}

	const { url, request, redirect } = context;

	// CSRF: cualquier POST debe venir del mismo origin (formularios/actions propios).
	if (request.method === 'POST') {
		const origin = request.headers.get('origin');
		if (origin && origin !== url.origin) {
			return new Response('Origin no permitido', { status: 403 });
		}
	}

	const isAdminRoute = url.pathname.startsWith('/admin');
	const isLoginRoute = url.pathname === '/admin/login';

	// Solo consultamos Supabase Auth en rutas /admin para rendimiento óptimo
	if (isAdminRoute) {
		if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
			if (import.meta.env.DEV) {
				console.warn('Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env');
			}
		}

		try {
			const supabase = createSupabaseServerClient(context);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			context.locals.user = user && user.email ? { id: user.id, email: user.email } : null;
		} catch (error) {
			console.error('Error al verificar sesión de Supabase:', error);
			context.locals.user = null;
		}

		if (!isLoginRoute && !context.locals.user) {
			return redirect('/admin/login');
		}
		if (isLoginRoute && context.locals.user) {
			return redirect('/admin');
		}
	} else {
		context.locals.user = null;
	}

	return next();
});
