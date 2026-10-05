import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createPost, deletePost, updatePost } from '../lib/blog';
import {
	uploadImageIfPresent,
	optimizeAndUploadImage,
	uploadVideo,
	isValidImageType,
	isValidVideoType,
	MAX_IMAGE_BYTES,
	MAX_VIDEO_BYTES,
} from '../lib/storage';
import { requireUser } from './utils';

export const blogActions = {
	createPost: defineAction({
		accept: 'form',
		input: z.object({
			title: z.string().min(1),
			category: z.string().min(1),
			excerpt: z.string().nullish().transform((v) => v ?? ''),
			content: z.string().nullish().transform((v) => v ?? ''),
			hero_image: z.instanceof(File).optional(),
			hero_image_alt: z.string().nullish().transform((v) => v || null),
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
				hero_image_alt: input.hero_image_alt,
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
			excerpt: z.string().nullish().transform((v) => v ?? ''),
			content: z.string().nullish().transform((v) => v ?? ''),
			hero_image: z.instanceof(File).optional(),
			existing_hero_image_url: z.string().nullish().transform((v) => v || null),
			hero_image_alt: z.string().nullish().transform((v) => v || null),
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
				hero_image_url: uploaded ?? input.existing_hero_image_url,
				hero_image_alt: input.hero_image_alt,
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

	// Sube una imagen o video insertado dentro del editor de contenido del blog.
	uploadEditorAsset: defineAction({
		accept: 'form',
		input: z.object({ file: z.instanceof(File) }),
		handler: async ({ file }, context) => {
			requireUser(context.locals);
			const isImage = isValidImageType(file.type);
			const isVideo = isValidVideoType(file.type);
			if (!isImage && !isVideo) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: 'Formato no permitido (usa JPG, PNG, WebP, MP4 o WebM).',
				});
			}
			const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
			if (file.size > maxBytes) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: `El archivo supera el máximo permitido (${isVideo ? '50MB' : '30MB'}).`,
				});
			}
			if (isImage) {
				return { url: await optimizeAndUploadImage(file), kind: 'image' };
			}
			return { url: await uploadVideo(file), kind: 'video' };
		},
	}),
};
