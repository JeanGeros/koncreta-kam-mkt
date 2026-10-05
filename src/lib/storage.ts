import { put } from '@vercel/blob';
import sharp from 'sharp';
import { env } from './env';

export const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 2000;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export function isValidImageType(type: string): boolean {
	return ALLOWED_IMAGE_TYPES.has(type);
}

export function isValidVideoType(type: string): boolean {
	return ALLOWED_VIDEO_TYPES.has(type);
}

/**
 * Optimiza la imagen (orientación EXIF, escalado a máx 2000px, WebP q88)
 * y la sube a Vercel Blob Storage.
 */
export async function optimizeAndUploadImage(image: File): Promise<string> {
	const optimized = await sharp(await image.arrayBuffer())
		.rotate() // respeta orientación EXIF
		.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
		.webp({ quality: 88 })
		.toBuffer();

	const name = image.name.replace(/\.[^.]+$/, '') || 'imagen';
	const blob = await put(`uploads/${Date.now()}-${name}.webp`, optimized, {
		access: 'public',
		contentType: 'image/webp',
		token: env.BLOB_READ_WRITE_TOKEN,
	});
	return blob.url;
}

export async function uploadImageIfPresent(image: File | undefined): Promise<string | null> {
	if (!image || image.size === 0) return null;
	if (!isValidImageType(image.type)) {
		throw new Error('Formato de imagen no permitido (usa JPG, PNG o WebP).');
	}
	if (image.size > MAX_IMAGE_BYTES) {
		throw new Error('La imagen supera los 30MB.');
	}
	return optimizeAndUploadImage(image);
}

export async function uploadVideo(file: File): Promise<string> {
	const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
		access: 'public',
		token: env.BLOB_READ_WRITE_TOKEN,
	});
	return blob.url;
}
