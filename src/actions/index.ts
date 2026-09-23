import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import {
	createSessionToken,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE_SECONDS,
	verifyPassword,
} from '../lib/auth';
import { getUserByEmail } from '../lib/users';
import { createProject, deleteProject, updateProject } from '../lib/projects';
import { createPost, deletePost, updatePost } from '../lib/blog';

// Las fotos de cámara/celular pesan 6-12MB. Con un tope bajo la gente las
// pasaba por compresores online y subía imágenes destrozadas; aceptamos el
// original y lo normalizamos aquí con sharp.
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 2000;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

function requireUser(locals: App.Locals) {
	if (!locals.user) {
		throw new ActionError({ code: 'UNAUTHORIZED', message: 'Debes iniciar sesión.' });
	}
}

function blobToken() {
	return process.env.BLOB_READ_WRITE_TOKEN || import.meta.env.BLOB_READ_WRITE_TOKEN;
}

// Reencodea a WebP con tope de ancho: subir el original y dejar que el
// navegador lo escale es lo que hacía que se vieran mal.
async function uploadImage(image: File): Promise<string> {
	const optimized = await sharp(await image.arrayBuffer())
		.rotate() // respeta el EXIF de orientación, que se pierde al reencodear
		.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
		.webp({ quality: 88 })
		.toBuffer();
	const name = image.name.replace(/\.[^.]+$/, '') || 'imagen';
	const blob = await put(`uploads/${Date.now()}-${name}.webp`, optimized, {
		access: 'public',
		contentType: 'image/webp',
		token: blobToken(),
	});
	return blob.url;
}

async function uploadImageIfPresent(image: File | undefined): Promise<string | null> {
	if (!image || image.size === 0) return null;
	if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
		throw new ActionError({ code: 'BAD_REQUEST', message: 'Formato de imagen no permitido (usa JPG, PNG o WebP).' });
	}
	if (image.size > MAX_IMAGE_BYTES) {
		throw new ActionError({ code: 'BAD_REQUEST', message: 'La imagen supera los 30MB.' });
	}
	return uploadImage(image);
}

// Adjuntos del formulario de contacto: Vercel corta el body de las funciones
// en 4.5MB, así que el tope real no puede ser mayor.
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function env(name: string): string | undefined {
	return process.env[name] || import.meta.env[name];
}

async function verifyTurnstile(token: string, ip: string) {
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: new URLSearchParams({ secret: env('TURNSTILE_SECRET_KEY') ?? '', response: token, remoteip: ip }),
	});
	const data = (await res.json()) as { success: boolean };
	if (!data.success) {
		throw new ActionError({ code: 'FORBIDDEN', message: 'No pudimos verificar el captcha. Inténtalo de nuevo.' });
	}
}

function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

type Row = [label: string, value: string, href?: string];

// HTML de correo: tablas y estilos inline porque Outlook/Gmail ignoran casi
// todo el CSS moderno. Todo lo que viene del formulario pasa por escapeHtml.
function emailHtml(logoUrl: string, title: string, rows: Row[], message?: string, replyTo?: string): string {
	const fields = rows
		.filter(([, value]) => value)
		.map(
			([label, value, href]) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #DEDDD8;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8F9490;font-weight:700;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
<td style="padding:10px 0;border-bottom:1px solid #DEDDD8;font-size:15px;color:#000000;">${
				href
					? `<a href="${escapeHtml(href)}" style="color:#FB6624;font-weight:700;text-decoration:none;">${escapeHtml(value)}</a>`
					: escapeHtml(value)
			}</td>
</tr>`,
		)
		.join('');
	const body = message
		? `<p style="margin:28px 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#FB6624;font-weight:700;">Mensaje</p>
<div style="background:#FBFAF8;border-left:3px solid #FB6624;padding:16px 18px;font-size:15px;line-height:1.6;color:#474747;white-space:pre-wrap;">${escapeHtml(message)}</div>`
		: '';
	return `<!doctype html><html><body style="margin:0;padding:0;background:#FBFAF8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBFAF8;padding:32px 16px;font-family:'Century Gothic','Avenir Next',Arial,sans-serif;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DEDDD8;border-radius:14px;overflow:hidden;">
<tr><td style="background:#000000;border-left:4px solid #FB6624;padding:24px 32px;">
<img src="${escapeHtml(logoUrl)}" width="160" height="62" alt="Koncreta Prefabricados" style="display:block;border:0;color:#FFFFFF;font-size:18px;font-weight:700;">
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.2;color:#000000;">${escapeHtml(title)}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${fields}</table>
${body}
${
	replyTo
		? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td style="background:#FB6624;border-radius:999px;"><a href="mailto:${escapeHtml(replyTo)}" style="display:inline-block;padding:14px 28px;color:#FFFFFF;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;">Responder a ${escapeHtml(replyTo)}</a></td></tr></table>`
		: ''
}
</td></tr>
<tr><td style="padding:18px 32px;background:#FBFAF8;border-top:1px solid #DEDDD8;font-size:12px;color:#8F9490;">Enviado desde el formulario del sitio web. Responde a este correo para contestarle directamente.</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function sendMail(mail: {
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
	attachment?: File;
}) {
	const port = Number(env('SMTP_PORT') || 465);
	const transport = nodemailer.createTransport({
		host: env('SMTP_HOST'),
		port,
		secure: port === 465,
		requireTLS: port !== 465, // 587 (Office 365) exige STARTTLS
		auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
	});
	try {
		await transport.sendMail({
			from: env('CONTACT_FROM') || env('SMTP_USER'),
			to: env('CONTACT_TO'),
			replyTo: mail.replyTo,
			subject: mail.subject,
			text: mail.text,
			html: mail.html,
			attachments:
				mail.attachment && mail.attachment.size > 0
					? [{ filename: mail.attachment.name, content: Buffer.from(await mail.attachment.arrayBuffer()) }]
					: undefined,
		});
	} catch (err) {
		console.error('SMTP error', err);
		throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos enviar el mensaje. Escríbenos por WhatsApp.' });
	}
}

function linesToBullets(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

export const server = {
	sendContact: defineAction({
		accept: 'form',
		input: z.object({
			tipo: z.enum(['contacto', 'newsletter']),
			nombre: z.string().max(200).optional(),
			empresa: z.string().max(200).optional(),
			correo: z.string().email(),
			telefono: z.string().max(50).optional(),
			mensaje: z.string().max(5000).optional(),
			tipo_proyecto: z.string().max(200).optional(),
			url_origen: z.string().max(500).optional(),
			adjunto: z.instanceof(File).optional(),
			'cf-turnstile-response': z.string().min(1, 'Completa el captcha.'),
		}),
		handler: async (input, context) => {
			if (input.adjunto && input.adjunto.size > MAX_ATTACHMENT_BYTES) {
				throw new ActionError({ code: 'BAD_REQUEST', message: 'El archivo supera los 4MB. Envíalo por correo o WhatsApp.' });
			}
			await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress);
			// ponytail: dominio del request; en local apunta a localhost y el correo muestra el alt.
			const logoUrl = new URL('/logo-lockup-light.png', context.url).href;

			if (input.tipo === 'newsletter') {
				await sendMail({
					subject: 'Nueva suscripción al newsletter',
					text: `Correo: ${input.correo}`,
					html: emailHtml(logoUrl, 'Nueva suscripción al newsletter', [['Correo', input.correo, `mailto:${input.correo}`]]),
				});
				return { success: true };
			}
			const rows: Row[] = [
				['Nombre', input.nombre ?? ''],
				['Empresa', input.empresa ?? ''],
				['Correo', input.correo, `mailto:${input.correo}`],
				['Teléfono', input.telefono ?? ''],
				['Tipo de proyecto', input.tipo_proyecto ?? ''],
				// El archivo va adjunto al correo; aquí solo se avisa que viene.
				['Adjunto', input.adjunto?.size ? `📎 ${input.adjunto.name} (${Math.ceil(input.adjunto.size / 1024)} KB)` : ''],
			];
			const text = [...rows.map(([label, value]) => `${label}: ${value}`), '', input.mensaje ?? ''].join('\n');
			await sendMail({
				subject: `Nuevo contacto web: ${input.nombre ?? input.correo}`,
				text,
				html: emailHtml(logoUrl, 'Nuevo contacto desde la web', rows, input.mensaje, input.correo),
				replyTo: input.correo,
				attachment: input.adjunto,
			});
			return { success: true };
		},
	}),

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
			location: z.string().default(''),
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
			location: z.string().default(''),
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

	// Sube una imagen o video insertado dentro del editor de contenido del blog.
	uploadEditorAsset: defineAction({
		accept: 'form',
		input: z.object({ file: z.instanceof(File) }),
		handler: async ({ file }, context) => {
			requireUser(context.locals);
			const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
			const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);
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
			if (!isVideo) {
				return { url: await uploadImage(file), kind: 'image' };
			}
			const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
				access: 'public',
				token: blobToken(),
			});
			return { url: blob.url, kind: 'video' };
		},
	}),
};
