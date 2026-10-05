import type { APIRoute } from 'astro';
import { createSupabaseServerClient, isSupabaseConfigured } from '../../lib/supabase';

export const ALL: APIRoute = async (context) => {
	if (isSupabaseConfigured()) {
		try {
			const supabase = createSupabaseServerClient(context);
			await supabase.auth.signOut();
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
		}
	}
	return context.redirect('/admin/login', 302);
};
