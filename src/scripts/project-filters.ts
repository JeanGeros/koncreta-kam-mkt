export function initProjectFilters(): void {
	const chips = document.querySelectorAll('#proyectos-filter-track .filter-chip');
	const cards = document.querySelectorAll('#portfolio-grid .portfolio-card');
	const emptyMsg = document.getElementById('portfolio-empty');

	if (!chips.length || !cards.length) return;

	chips.forEach((chip) => {
		chip.addEventListener('click', () => {
			chips.forEach((c) => c.classList.remove('active'));
			chip.classList.add('active');
			const cat = (chip as HTMLElement).dataset.cat;
			let visibleCount = 0;

			cards.forEach((card) => {
				const cardEl = card as HTMLElement;
				const match = cat === 'todos' || cardEl.dataset.cat === cat;
				cardEl.style.display = match ? '' : 'none';
				if (match) visibleCount++;
			});

			if (emptyMsg) {
				emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
			}
		});
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProjectFilters);
} else {
	initProjectFilters();
}
