import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createProject, deleteProject, updateProject } from '../lib/projects';
import { uploadImageIfPresent } from '../lib/storage';
import { requireUser, linesToBullets } from './utils';

export const projectActions = {
	createProject: defineAction({
		accept: 'form',
		input: z.object({
			title: z.string().min(1),
			category: z.string().min(1),
			location: z.string().nullish().transform((v) => v ?? ''),
			bullets: z.string().nullish().transform((v) => v ?? ''),
			image: z.instanceof(File).optional(),
			image_alt: z.string().nullish().transform((v) => v || null),
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
				image_alt: input.image_alt,
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
			location: z.string().nullish().transform((v) => v ?? ''),
			bullets: z.string().nullish().transform((v) => v ?? ''),
			image: z.instanceof(File).optional(),
			existing_image_url: z.string().nullish().transform((v) => v || null),
			image_alt: z.string().nullish().transform((v) => v || null),
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
				image_url: uploaded ?? input.existing_image_url,
				image_alt: input.image_alt,
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
};
