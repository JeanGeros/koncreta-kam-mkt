// Alinea categorias y descripciones con la planilla de Drive
// (17bZ7hsFu6I1Rh0o-a0Hdm1zoPvNUXzCHh5NYgJ3hEUA), columnas CATEGORIA y
// DESCRIPCION.
//
// Decisiones al transcribir:
//   - Se copian las etiquetas de la planilla tal cual, aunque queden
//     categorias de un solo proyecto (Canaletas, Dados, Tapas...).
//   - "Otras piezas" / "Otras Piezas" conviven en la planilla con distinta
//     capitalizacion para la misma categoria: se unifica en minuscula.
//   - La fila del cerco cubre dos carpetas, asi que su categoria y su
//     descripcion se aplican a los dos proyectos.
//   - Solo se cargan las descripciones que aportan datos (dimensiones,
//     detalle tecnico). Las que repiten el titulo ("Sumideros", "Losas -
//     Bess") se dejan vacias: duplicar el titulo en la ficha no informa.
//   - Las descripciones que en la planilla venian en mayuscula sostenida se
//     pasan a texto normal; se muestran en la web y gritaban.
//
// Uso: node --env-file=.env.local scripts/recategorizar-proyectos.mjs [--apply]
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const APPLY = process.argv.includes('--apply');

// titulo en la base -> [categoria, descripcion?]
const PLANILLA = [
	['Cámara eléctrica de media tensión — BESS Sol de los Andes', 'Cámaras', 'Cámara eléctrica de media tensión de 1500x3000x1250 mm, con inserto de borde metálico embebido en el hormigón y tapas metálicas desarmables.'],
	['Cámara cilíndrica', 'Cámaras', 'Diámetro interno desde 800 mm. Con o sin fondo.'],
	['Cámara cilíndrica decantadora y recolectora', 'Cámaras', 'Diámetro interno desde 800 mm.'],
	['Cámara de válvulas', 'Cámaras'],
	['Cámara eléctrica', 'Cámaras'],
	['Cámara modulada', 'Cámaras'],
	['Tapas de cámaras', 'Cámaras'],

	['Tapas de trincheras', 'Tapas'],

	['Canaletas para canal disipador — Parque Fotovoltaico Concorde', 'Canaletas', 'Canaletas para canal disipador de 3400x1000x1500 mm. Diseño de piezas e izajes de Koncreta Prefabricados.'],

	['Durmientes', 'Otras piezas'],
	['Sumideros', 'Otras piezas'],

	['Cerco bulldog — Subestación Jadresic Antigua Parina', 'Cerco perimetral', 'Cerco tipo bulldog con fundaciones y postes de 3,20 m de alto.'],
	['Cerco bulldog con fundaciones incorporadas', 'Cerco perimetral', 'Cerco tipo bulldog con fundaciones y postes de 3,20 m de alto.'],

	['Dados prefabricados — Codelco División Gabriela Mistral', 'Dados', 'Dados prefabricados de 2000x1500x1100 mm.'],

	['Fundaciones y canaletas — BESS Atacama', 'Fundaciones y Canaletas'],

	['Fundaciones con pedestal para PCS — BESS Sol de los Andes', 'Fundaciones', 'Fundaciones con pedestal para PCS de 4750x2000x1200 mm. Juego de 4 fundaciones conectadas mediante pernos horizontales colocados en su base.'],
	['Fundaciones con insertos', 'Fundaciones'],
	['Fundaciones para contenedores de baterías — BESS', 'Fundaciones'],
	['Fundaciones para contenedores de baterías — BESS Copihue', 'Fundaciones'],
	['Fundaciones de pararrayos y parrones — BESS Atacama', 'Fundaciones'],
	['Fundaciones para sala eléctrica Agrosonda — BESS Atacama', 'Fundaciones'],
	['Losas de fundación — BESS', 'Fundaciones'],
	['Power China', 'Fundaciones'],
];

const enBase = await sql`select id, title, category from projects`;

// Falla temprano si un titulo cambio en el admin, en vez de actualizar a medias.
const porTitulo = new Map(enBase.map((p) => [p.title, p]));
const huerfanos = PLANILLA.filter(([t]) => !porTitulo.has(t)).map(([t]) => t);
const sinFila = enBase.filter((p) => !PLANILLA.some(([t]) => t === p.title)).map((p) => p.title);
if (huerfanos.length || sinFila.length) {
	if (huerfanos.length) console.error('titulos de la planilla que no existen en la base:\n  ' + huerfanos.join('\n  '));
	if (sinFila.length) console.error('proyectos en la base sin fila en la planilla:\n  ' + sinFila.join('\n  '));
	process.exit(1);
}

let cambios = 0;
for (const [titulo, categoria, descripcion] of PLANILLA) {
	const actual = porTitulo.get(titulo);
	const mueve = actual.category !== categoria;
	if (mueve || descripcion) cambios += 1;

	console.log(
		`${mueve ? '~' : ' '} ${titulo}\n` +
		`    ${actual.category}${mueve ? ` -> ${categoria}` : ' (sin cambio)'}` +
		(descripcion ? `\n    desc: ${descripcion}` : '')
	);

	if (APPLY) {
		await sql`
			UPDATE projects
			SET category = ${categoria},
			    bullets = ${sql.json(descripcion ? [descripcion] : [])},
			    updated_at = now()
			WHERE id = ${actual.id}
		`;
	}
}

// En dry-run el conteo sale de la planilla, no de la base: consultarla
// devolveria el estado viejo bajo el titulo "como quedaria".
const conteo = APPLY
	? (await sql`select category, count(*)::int as count from projects group by category order by count(*) desc`)
	: [...PLANILLA.reduce((m, [, c]) => m.set(c, (m.get(c) ?? 0) + 1), new Map())]
			.map(([category, count]) => ({ category, count }))
			.sort((a, b) => b.count - a.count);
console.log('\ncategorias' + (APPLY ? ' tras aplicar:' : ' que quedarian:'));
for (const c of conteo) console.log(`  ${String(c.count).padStart(2)}  ${c.category}`);

console.log(`\n${cambios} proyectos con cambios` + (APPLY ? ' aplicados.' : ' (dry-run; usar --apply para escribir)'));
await sql.end();
