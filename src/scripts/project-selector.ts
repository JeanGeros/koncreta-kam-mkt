export type SelectorProjectItem = {
	tag: string;
	title: string;
	desc: string;
	img: string | null;
};

export function initProjectSelector(): void {
	const dataScript = document.getElementById('selector-projects-data');
	if (!dataScript || !dataScript.textContent) return;

	let projects: SelectorProjectItem[] = [];
	try {
		projects = JSON.parse(dataScript.textContent);
	} catch (e) {
		console.error('Error al parsear datos de proyectos del selector:', e);
		return;
	}

	if (!projects.length) return;

	let actual = 0;
	const track = document.getElementById('sel-track');
	const selImage = document.getElementById('sel-image') as HTMLImageElement | null;
	const selVisual = document.querySelector('.selector-visual');
	const selTag = document.getElementById('sel-tag');
	const selTitle = document.getElementById('sel-title');
	const selDesc = document.getElementById('sel-desc');

	function selectProject(i: number): void {
		const p = projects[i];
		if (!p) return;

		if (selTag) selTag.textContent = p.tag;
		if (selTitle) selTitle.textContent = p.title;
		if (selDesc) {
			selDesc.textContent = p.desc;
			selDesc.style.display = p.desc ? '' : 'none';
		}

		if (p.img) {
			selVisual?.querySelector('.placeholder-pattern')?.remove();
			if (selVisual && !selVisual.querySelector('img') && selImage) {
				selVisual.appendChild(selImage);
			}
			if (selImage) {
				selImage.src = p.img;
				selImage.style.display = 'block';
			}
		} else {
			if (selImage) selImage.style.display = 'none';
			if (selVisual && !selVisual.querySelector('.placeholder-pattern')) {
				const ph = document.createElement('div');
				ph.className = 'placeholder-pattern';
				ph.innerHTML = '<span class="ph-text">Imagen referencial<br>disponible en levantamiento fotográfico</span>';
				selVisual.appendChild(ph);
			}
		}

		document.querySelectorAll('.selector-thumb').forEach((t, idx) => {
			t.classList.toggle('active', idx === i);
		});
		actual = i;
	}

	function renderThumbs(): void {
		if (!track) return;
		track.innerHTML = '';
		projects.forEach((p, i) => {
			const div = document.createElement('div');
			div.className = 'selector-thumb' + (i === 0 ? ' active' : '');
			div.innerHTML =
				(p.img ? `<img src="${p.img}" alt="${p.title}" loading="lazy">` : `<div class="ph-mini"></div>`) +
				`<span class="thumb-label mono">${p.tag}</span>`;
			div.addEventListener('click', () => selectProject(i));
			track.appendChild(div);
		});
	}

	function mover(paso: number): void {
		if (!projects.length) return;
		const i = (actual + paso + projects.length) % projects.length;
		selectProject(i);
		document.querySelectorAll('.selector-thumb')[i]?.scrollIntoView({
			behavior: 'smooth',
			inline: 'nearest',
			block: 'nearest',
		});
	}

	document.querySelector('.selector-nav.prev')?.addEventListener('click', () => mover(-1));
	document.querySelector('.selector-nav.next')?.addEventListener('click', () => mover(1));

	renderThumbs();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProjectSelector);
} else {
	initProjectSelector();
}
