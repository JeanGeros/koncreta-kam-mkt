export type ServiceData = {
	tag: string;
	title: string;
	img: string;
	bullets: string[];
};

const services: ServiceData[] = [
	{
		tag: 'ASESORÍA',
		title: 'Asesoría del cambio de obra “in situ” a piezas prefabricadas en tu proyecto',
		img: '/img/srv-asesoria.jpg',
		bullets: [
			'Asesoría del cambio de obra “in situ” a piezas prefabricadas.',
			'Optimización del proyecto junto a tu equipo de ingeniería',
			'Transformación de partidas de hormigón in situ a piezas prefabricadas',
			'Beneficios en ahorro de tiempo, mano de obra y recursos en obra.',
		],
	},
	{
		tag: 'INGENIERÍA',
		title: 'Ingeniería de modulación e izajes',
		img: '/img/srv-izaje.jpg',
		bullets: [
			'Piezas de hormigón hechas a medida según tu ingeniería',
			'Producción con precisión y control de calidad',
			'Fabricación en ambientes controlados de planta',
		],
	},
	{
		tag: 'FABRICACIÓN',
		title: 'Fabricación de piezas de hormigón',
		img: '/img/srv-fabricacion.jpg',
		bullets: [
			'Trazabilidad y comunicación directa sobre avances del proceso de fabricación.',
			'Control de calidad del proceso de fabricación.',
			'Aseguramiento de la calidad normativa de los insumos como de las dimensiones de la modulación de cada pieza.',
			'Proceso continuo, sin tiempos muertos.',
		],
	},
	{
		tag: 'LOGÍSTICA',
		title: 'Transporte de piezas de hormigón',
		img: '/img/srv-transporte.jpg',
		bullets: [
			'Trazabilidad y comunicación sobre el despacho y stock de piezas',
			'Transporte seguro y confiable de piezas prefabricadas',
			'Traslado directo desde planta hasta tu proyecto',
			'Garantía de integridad y puntualidad en la entrega',
		],
	},
	{
		tag: 'MONTAJE',
		title: 'Montaje de piezas en obra',
		img: '/img/srv-montaje.jpg',
		bullets: [
			'Soporte para la instalación rápida y precisa de cada componente',
			'Opciones de montaje, ejecutado por nuestro propio equipo técnico en obra del proyecto',
		],
	},
	{
		tag: 'ORNAMENTAL',
		title: 'Piezas para proyectos ornamentales y áreas verdes.',
		img: '/img/srv-ornamental.jpg',
		bullets: [
			'Elementos decorativos y funcionales de hormigón',
			'Embellecimiento de espacios exteriores',
			'Refuerzo y delimitación de áreas exteriores',
		],
	},
];

const waMessages = [
	'Hola Koncreta, quiero evaluar cambiar mi proyecto de in situ a prefabricado',
	'Hola Koncreta, quiero cotizar fabricaci%C3%B3n de piezas de hormig%C3%B3n a medida',
	'Hola Koncreta, quiero consultar por ingenier%C3%ADa de modulaci%C3%B3n e izajes',
	'Hola Koncreta, quiero consultar por transporte de piezas',
	'Hola Koncreta, quiero consultar por montaje de piezas en obra',
	'Hola Koncreta, quiero consultar por piezas ornamentales y de %C3%A1reas verdes',
];

function panelHTML(i: number): string {
	const s = services[i];
	if (!s) return '';
	return `
    <div class="ep-media"><span class="ep-tag mono">${s.tag}</span><img src="${s.img}" alt="${s.title}"></div>
    <div class="ep-scope">Alcance del servicio</div>
    <h3>${s.title}</h3>
    <ul>${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
    <div class="ep-cta"><a class="btn btn-primary" href="https://wa.me/56983984326?text=${waMessages[i]}" target="_blank" rel="noopener">Cotizar aquí</a></div>
  `;
}

export function initServiceExplorer(): void {
	const panel = document.getElementById('explorer-panel');
	if (!panel) return;

	function renderService(i: number): void {
		if (panel) panel.innerHTML = panelHTML(i);
	}

	document.querySelectorAll('.explorer-item').forEach((item) => {
		const tab = item.querySelector('.explorer-tab') as HTMLElement | null;
		const mobilePanel = item.querySelector('.explorer-mobile-panel');
		if (!tab || !mobilePanel) return;
		const i = parseInt(tab.dataset.service || '0', 10);
		mobilePanel.innerHTML = panelHTML(i);
	});

	document.querySelectorAll('.explorer-tab').forEach((tab) => {
		tab.addEventListener('click', () => {
			const el = tab as HTMLElement;
			const i = parseInt(el.dataset.service || '0', 10);
			document.querySelectorAll('.explorer-tab').forEach((t) => t.classList.remove('active'));
			tab.classList.add('active');
			renderService(i);

			const item = tab.closest('.explorer-item');
			if (!item) return;
			const wasOpen = item.classList.contains('open');
			document.querySelectorAll('.explorer-item').forEach((it) => it.classList.remove('open'));
			if (!wasOpen) item.classList.add('open');
		});
	});

	renderService(0);

	// Acordeón de diferenciadores
	document.querySelectorAll('.diff-full-trigger').forEach((trigger) => {
		trigger.addEventListener('click', () => {
			const item = trigger.closest('.diff-full-item');
			if (!item) return;
			const wasOpen = item.classList.contains('open');
			document.querySelectorAll('.diff-full-item').forEach((i) => i.classList.remove('open'));
			if (!wasOpen) item.classList.add('open');
		});
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initServiceExplorer);
} else {
	initServiceExplorer();
}
