import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { put } from '@vercel/blob';
import {
	createSessionToken,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE_SECONDS,
	verifyPassword,
} from '../lib/auth';
import { getUserByEmail } from '../lib/users';
import { createProject, deleteProject, updateProject } from '../lib/projects';
import { createPost, deletePost, updatePost } from '../lib/blog';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function requireUser(locals: App.Locals) {
	if (!locals.user) {
		throw new ActionError({ code: 'UNAUTHORIZED', message: 'Debes iniciar sesión.' });
	}
}

async function uploadImageIfPresent(image: File | undefined): Promise<string | null> {
	if (!image || image.size === 0) return null;
	if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
		throw new ActionError({ code: 'BAD_REQUEST', message: 'Formato de imagen no permitido (usa JPG, PNG o WebP).' });
	}
	if (image.size > MAX_IMAGE_BYTES) {
		throw new ActionError({ code: 'BAD_REQUEST', message: 'La imagen supera los 5MB.' });
	}
	const blob = await put(`uploads/${Date.now()}-${image.name}`, image, {
		access: 'public',
		token: import.meta.env.BLOB_READ_WRITE_TOKEN,
	});
	return blob.url;
}

function linesToBullets(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

export const server = {
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
				// Sin "Mantener sesión activa" la cookie muere al cerrar el navegador
				// (el token igual expira a los 7 días del lado del servidor).
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

	createProject: defineAction({
		accept: 'form',
		input: z.object({
			title: z.string().min(1),
			category: z.string().min(1),
			location: z.string().min(1),
			bullets: z.string(),
			image: z.instanceof(File).optional(),
			image_alt: z.string().optional(),
			published: z.string().optional(),
			sort_order: z.coerce.number().default(0),
		}),
		handler: async (input, context) => {
			requireUser(context.locals);
			const image_url = await uploadImageIfPresent(input.image);
			return createProject({
				title: input.title,
				category: input.category,
				location: input.location,
				bullets: linesToBullets(input.bullets),
				image_url,
				image_alt: input.image_alt || null,
				published: input.published === 'on',
				sort_order: input.sort_order,
			});
		},
	}),

	updateProject: defineAction({
		accept: 'form',
		input: z.object({
			id: z.coerce.number(),
			title: z.string().min(1),
			category: z.string().min(1),
			location: z.string().min(1),
			bullets: z.string(),
			image: z.instanceof(File).optional(),
			existing_image_url: z.string().optional(),
			image_alt: z.string().optional(),
			published: z.string().optional(),
			sort_order: z.coerce.number().default(0),
		}),
		handler: async (input, context) => {
			requireUser(context.locals);
			const uploaded = await uploadImageIfPresent(input.image);
			const result = await updateProject(input.id, {
				title: input.title,
				category: input.category,
				location: input.location,
				bullets: linesToBullets(input.bullets),
				image_url: uploaded ?? input.existing_image_url ?? null,
				image_alt: input.image_alt || null,
				published: input.published === 'on',
				sort_order: input.sort_order,
			});
			if (!result) throw new ActionError({ code: 'NOT_FOUND' });
			return result;
		},
	}),

	deleteProject: defineAction({
		accept: 'form',
		input: z.object({ id: z.coerce.number() }),
		handler: async ({ id }, context) => {
			requireUser(context.locals);
			await deleteProject(id);
			return { success: true };
		},
	}),

	createPost: defineAction({
		accept: 'form',
		input: z.object({
			title: z.string().min(1),
			category: z.string().min(1),
			excerpt: z.string().min(1),
			content: z.string().min(1),
			hero_image: z.instanceof(File).optional(),
			hero_image_alt: z.string().optional(),
			featured: z.string().optional(),
			published: z.string().optional(),
		}),
		handler: async (input, context) => {
			requireUser(context.locals);
			const hero_image_url = await uploadImageIfPresent(input.hero_image);
			return createPost({
				title: input.title,
				category: input.category,
				excerpt: input.excerpt,
				content: input.content,
				hero_image_url,
				hero_image_alt: input.hero_image_alt || null,
				featured: input.featured === 'on',
				published: input.published === 'on',
			});
		},
	}),

	updatePost: defineAction({
		accept: 'form',
		input: z.object({
			id: z.coerce.number(),
			title: z.string().min(1),
			category: z.string().min(1),
			excerpt: z.string().min(1),
			content: z.string().min(1),
			hero_image: z.instanceof(File).optional(),
			existing_hero_image_url: z.string().optional(),
			hero_image_alt: z.string().optional(),
			featured: z.string().optional(),
			published: z.string().optional(),
		}),
		handler: async (input, context) => {
			requireUser(context.locals);
			const uploaded = await uploadImageIfPresent(input.hero_image);
			const result = await updatePost(input.id, {
				title: input.title,
				category: input.category,
				excerpt: input.excerpt,
				content: input.content,
				hero_image_url: uploaded ?? input.existing_hero_image_url ?? null,
				hero_image_alt: input.hero_image_alt || null,
				featured: input.featured === 'on',
				published: input.published === 'on',
			});
			if (!result) throw new ActionError({ code: 'NOT_FOUND' });
			return result;
		},
	}),

	deletePost: defineAction({
		accept: 'form',
		input: z.object({ id: z.coerce.number() }),
		handler: async ({ id }, context) => {
			requireUser(context.locals);
			await deletePost(id);
			return { success: true };
		},
	}),
};
