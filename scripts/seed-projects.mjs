// Inserta los 7 proyectos reales que estaban hardcodeados en proyectos.astro.
// Ejecutar una sola vez: node --env-file=.env.local scripts/seed-projects.mjs

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

const projects = [
	{
		title: 'Fundación de baterías con tope sísmico',
		category: 'Fundaciones',
		location: 'Proyecto VKON-036 · Región de Antofagasta',
		bullets: [
			'Fabricación bajo memoria de cálculo propia (ficha VKON-036)',
			'Ganchos de izaje Ø25mm y pasadas Ø46mm / Ø110mm embebidas',
			'Tope sísmico tipo 2 integrado según diseño estructural del cliente',
			'Enfierradura revisada y validada antes del vaciado en planta',
		],
		image_url: '/img/k-b3042b59.jpg',
		image_alt:
			'Fundación de baterías prefabricada por Koncreta con ganchos de izaje y tope sísmico, lista en patio de acopio',
	},
	{
		title: 'Cámaras cilíndricas para faena minera',
		category: 'Minería',
		location: 'Pozo Almonte, Región de Tarapacá',
		bullets: [
			'12 cámaras cilíndricas H30 fabricadas bajo especificación de ingeniería',
			'Insertos metálicos embebidos y tolerancia dimensional ± 3 mm',
			'Transporte homologado a faena y montaje realizado por equipo propio',
			'Trazabilidad NCh con código QR pieza a pieza',
		],
		image_url: '/img/k-debd514c.jpg',
		image_alt:
			'Cámara cilíndrica minera prefabricada por Koncreta, transportada a faena en Pozo Almonte',
	},
	{
		title: 'Fundaciones con pedestales para baterías industriales',
		category: 'Fundaciones',
		location: 'Planta Antofagasta',
		bullets: [
			'30 unidades fabricadas en serie con control dimensional por lote',
			'Diseño a medida según memoria de cálculo del cliente',
			'Despacho escalonado según cronograma de obra',
			'Cero rechazos en la recepción de las piezas',
		],
		image_url: '/img/k-21fdd5a6.jpg',
		image_alt:
			'Fundaciones con pedestales prefabricadas por Koncreta, listas para despacho en planta Antofagasta',
	},
	{
		title: 'Montaje de muros y dados de fundación',
		category: 'Infraestructura industrial',
		location: 'Proyecto industrial, Antofagasta',
		bullets: [
			'Montaje ejecutado íntegramente por equipo propio de Koncreta',
			'Memoria de cálculo de izaje validada antes de cada maniobra',
			'Coordinación directa con la jefatura de obra del cliente',
			'Entrega dentro del plazo comprometido en licitación',
		],
		image_url: '/img/k-188c1eba.jpg',
		image_alt: 'Montaje de piezas prefabricadas Koncreta en obra, equipo técnico en terreno',
	},
	{
		title: 'Barreras New Jersey para proyecto vial',
		category: 'Vial',
		location: 'Región de Antofagasta',
		bullets: [
			'Fabricación en serie bajo especificación de proyecto vial',
			'Hormigón H30 con acabado de encofrado industrial',
			'Logística de entrega coordinada por tramos de obra',
			'Cumplimiento de norma de señalización y reflectancia',
		],
		image_url: null,
		image_alt: null,
	},
	{
		title: 'Registros de servicios para planta de proceso',
		category: 'Cámaras y registros',
		location: 'Faena minera, Región de Antofagasta',
		bullets: [
			'Cámaras de paso para instalaciones eléctricas subterráneas',
			'Tapas y marcos metálicos embebidos en fábrica',
			'Fabricación coordinada con ingeniería eléctrica del proyecto',
			'Entrega certificada con registro fotográfico por pieza',
		],
		image_url: null,
		image_alt: null,
	},
	{
		title: 'Dados de fundación para estructuras metálicas',
		category: 'Fundaciones',
		location: 'Pozo Almonte, Región de Tarapacá',
		bullets: [
			'Fabricación a medida según planos de estructura metálica',
			'Anclajes e insertos coordinados con montaje de acero',
			'Despacho directo a faena con vehículo homologado',
			'Sin observaciones en la inspección de recepción',
		],
		image_url: null,
		image_alt: null,
	},
];

function slugify(title) {
	return title
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

for (const [index, p] of projects.entries()) {
	const slug = slugify(p.title);
	await sql`
		INSERT INTO projects (title, slug, category, location, bullets, image_url, image_alt, published, sort_order)
		VALUES (${p.title}, ${slug}, ${p.category}, ${p.location}, ${JSON.stringify(p.bullets)}::jsonb,
		        ${p.image_url}, ${p.image_alt}, true, ${index})
		ON CONFLICT (slug) DO NOTHING
	`;
	console.log(`✓ ${p.title}`);
}

console.log(`Listo: ${projects.length} proyectos procesados.`);
await sql.end();
