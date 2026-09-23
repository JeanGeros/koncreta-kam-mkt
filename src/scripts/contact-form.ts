import { actions } from 'astro:actions';

declare const turnstile: { reset(el: Element): void } | undefined;

// Envía por la action sendContact todo form[data-contact-form] de la página.
document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach((form) => {
	const status = form.querySelector<HTMLElement>('[data-form-status]')!;
	const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		button.disabled = true;
		status.textContent = 'Enviando…';
		const { error } = await actions.sendContact(new FormData(form));
		button.disabled = false;
		if (error) {
			status.textContent = error.message || 'Ocurrió un error. Inténtalo de nuevo.';
		} else {
			form.reset();
			status.textContent = '¡Gracias! Te contactaremos pronto.';
		}
		// El token de Turnstile es de un solo uso.
		const widget = form.querySelector('.cf-turnstile');
		if (widget && typeof turnstile !== 'undefined') turnstile.reset(widget);
	});
});
