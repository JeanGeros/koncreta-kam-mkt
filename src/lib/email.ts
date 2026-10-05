import nodemailer from 'nodemailer';
import { env } from './env';

export type EmailRow = [label: string, value: string, href?: string];

export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Genera el HTML responsive y compatible con Outlook/Gmail para las notificaciones de contacto.
 */
export function renderContactEmailHtml(
	logoUrl: string,
	title: string,
	rows: EmailRow[],
	message?: string,
	replyTo?: string
): string {
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
</tr>`
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

export type SendMailOptions = {
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
	attachment?: File;
};

export async function sendMail(options: SendMailOptions): Promise<void> {
	const port = env.SMTP_PORT;
	const transport = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		secure: port === 465,
		requireTLS: port !== 465, // 587 (Office 365) exige STARTTLS
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS,
		},
	});

	await transport.sendMail({
		from: env.CONTACT_FROM,
		to: env.CONTACT_TO,
		replyTo: options.replyTo,
		subject: options.subject,
		text: options.text,
		html: options.html,
		attachments:
			options.attachment && options.attachment.size > 0
				? [
						{
							filename: options.attachment.name,
							content: Buffer.from(await options.attachment.arrayBuffer()),
						},
					]
				: undefined,
	});
}
