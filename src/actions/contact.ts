import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { verifyTurnstile } from '../lib/captcha';
import {
	sendMail,
	renderContactEmailHtml,
	MAX_ATTACHMENT_BYTES,
	type EmailRow,
} from '../lib/email';

export const contactActions = {
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
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: 'El archivo supera los 4MB. Envíalo por correo o WhatsApp.',
				});
			}
			const verified = await verifyTurnstile(input['cf-turnstile-response'], context.clientAddress);
			if (!verified) {
				throw new ActionError({
					code: 'FORBIDDEN',
					message: 'No pudimos verificar el captcha. Inténtalo de nuevo.',
				});
			}

			const logoUrl = new URL('/logo-lockup-light.png', context.url).href;

			if (input.tipo === 'newsletter') {
				await sendMail({
					subject: 'Nueva suscripción al newsletter',
					text: `Correo: ${input.correo}`,
					html: renderContactEmailHtml(logoUrl, 'Nueva suscripción al newsletter', [
						['Correo', input.correo, `mailto:${input.correo}`],
					]),
				});
				return { success: true };
			}

			const rows: EmailRow[] = [
				['Nombre', input.nombre ?? ''],
				['Empresa', input.empresa ?? ''],
				['Correo', input.correo, `mailto:${input.correo}`],
				['Teléfono', input.telefono ?? ''],
				['Tipo de proyecto', input.tipo_proyecto ?? ''],
				['Adjunto', input.adjunto?.size ? `📎 ${input.adjunto.name} (${Math.ceil(input.adjunto.size / 1024)} KB)` : ''],
			];

			const text = [...rows.map(([label, value]) => `${label}: ${value}`), '', input.mensaje ?? ''].join('\n');

			await sendMail({
				subject: `Nuevo contacto web: ${input.nombre ?? input.correo}`,
				text,
				html: renderContactEmailHtml(logoUrl, 'Nuevo contacto desde la web', rows, input.mensaje, input.correo),
				replyTo: input.correo,
				attachment: input.adjunto,
			});

			return { success: true };
		},
	}),
};
