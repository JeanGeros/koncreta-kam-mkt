import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createSupabaseServerClient, isSupabaseConfigured } from '../lib/supabase';

export const authActions = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			email: z.string().email(),
			password: z.string().min(1),
			remember: z.string().optional(),
		}),
		handler: async ({ email, password }, context) => {
			if (!isSupabaseConfigured()) {
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en el archivo .env',
				});
			}

			const supabase = createSupabaseServerClient(context);
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) {
				throw new ActionError({
					code: 'UNAUTHORIZED',
					message: 'Correo o contraseña incorrectos.',
				});
			}
			return { success: true };
		},
	}),

	logout: defineAction({
		accept: 'form',
		handler: async (_input, context) => {
			if (!isSupabaseConfigured()) {
				return { success: true };
			}
			const supabase = createSupabaseServerClient(context);
			await supabase.auth.signOut();
			return { success: true };
		},
	}),

	requestPasswordReset: defineAction({
		accept: 'form',
		input: z.object({
			email: z.string().email('Ingresa un correo válido.'),
		}),
		handler: async ({ email }, context) => {
			if (!isSupabaseConfigured()) {
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en el archivo .env',
				});
			}

			const supabase = createSupabaseServerClient(context);
			const origin = context.url.origin;
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${origin}/admin/restablecer-clave`,
			});

			if (error) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: error.message || 'No se pudo enviar el correo de recuperación.',
				});
			}

			return { success: true };
		},
	}),

	updatePassword: defineAction({
		accept: 'form',
		input: z.object({
			password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
			password_confirm: z.string().min(6, 'Confirma la contraseña.'),
		}),
		handler: async ({ password, password_confirm }, context) => {
			if (password !== password_confirm) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: 'Las contraseñas no coinciden.',
				});
			}

			if (!isSupabaseConfigured()) {
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en el archivo .env',
				});
			}

			const supabase = createSupabaseServerClient(context);
			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: error.message || 'Error al actualizar la contraseña.',
				});
			}

			return { success: true };
		},
	}),
};
