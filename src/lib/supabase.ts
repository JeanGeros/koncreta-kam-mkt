import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { env } from './env';

export function isSupabaseConfigured(): boolean {
	return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

export function createSupabaseServerClient(context: {
	request: Request;
	cookies: AstroCookies;
}) {
	if (!isSupabaseConfigured()) {
		throw new Error(
			'Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en las variables de entorno (.env).'
		);
	}

	return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					context.cookies.set(name, value, {
						...options,
						path: options?.path ?? '/',
						sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
						secure: import.meta.env.PROD,
						httpOnly: options?.httpOnly ?? true,
					});
				});
			},
		},
	});
}
