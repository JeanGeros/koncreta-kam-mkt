/**
 * Observador de intersección para animaciones suaves de entrada (reveal on scroll)
 */
export function initRevealObserver(): void {
	const reveals = document.querySelectorAll('[data-reveal]');
	if (!reveals.length) return;

	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					io.unobserve(e.target);
				}
			});
		},
		{ threshold: 0 }
	);

	reveals.forEach((el) => io.observe(el));
}

// Auto-inicialización si el DOM ya está listo o al cargarse
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initRevealObserver);
} else {
	initRevealObserver();
}
