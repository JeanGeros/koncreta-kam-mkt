import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createSupabaseServerClient } from '../lib/supabase';

export const authActions = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			email: z.string().email(),
			password: z.string().min(1),
			remember: z.string().optional(),
		}),
		handler: async ({ email, password }, context) => {
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
			const supabase = createSupabaseServerClient(context);
			await supabase.auth.signOut();
			return { success: true };
		},
	}),
};
