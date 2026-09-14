// Carga masiva de proyectos desde FOTOS_LISTAS/ + la planilla de Drive.
//
// Decisiones ya tomadas (ver conversacion):
//   - Las fotos se publican con la marca de agua tal cual vienen.
//   - El cerco va como DOS proyectos (hay dos carpetas para una sola fila).
//   - Canaletas -> Vial. Durmientes y Sumideros -> Vial. Tapas de trincheras
//     -> Camaras y registros. Power china -> Infraestructura industrial.
//   - location y bullets quedan vacios a proposito.
//   - Se usa la primera foto de cada carpeta; se cambian despues por el admin.
//   - Queda fuera "Jadresic Parque Fotovoltaico" (marcado NO INCLUIR).
//   - Las dos filas de "contenedores de baterias" son la misma carpeta de
//     Drive, asi que va un solo proyecto.
//
// Uso: node --env-file=.env.local scripts/importar-proyectos.mjs [--apply]
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import sharp from 'sharp';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const APPLY = process.argv.includes('--apply');
const RAIZ = 'FOTOS_LISTAS';
const DESTINO = 'public/img/proyectos';

// carpeta relativa a FOTOS_LISTAS -> { titulo, categoria }
const PROYECTOS = [
	['CÁMARAS/Cámara Eléctrica Media Tensión', 'Cámara eléctrica de media tensión — BESS Sol de los Andes', 'Cámaras y registros'],
	['CÁMARAS/Cámara Cilíndrica', 'Cámara cilíndrica', 'Cámaras y registros'],
	['CÁMARAS/Cámara Cilíndrica Decantadoras y Recolectoras', 'Cámara cilíndrica decantadora y recolectora', 'Cámaras y registros'],
	['CÁMARAS/Cámara de Valvulas', 'Cámara de válvulas', 'Cámaras y registros'],
	['CÁMARAS/Cámara Eléctrica-20260810T191348Z-1-001', 'Cámara eléctrica', 'Cámaras y registros'],
	['CÁMARAS/Cámara Modulada-20260810T191353Z-1-001', 'Cámara modulada', 'Cámaras y registros'],
	['CÁMARAS/Tapas de Cámaras', 'Tapas de cámaras', 'Cámaras y registros'],
	['CÁMARAS/Tapas de Trincheras', 'Tapas de trincheras', 'Cámaras y registros'],

	['ETC/Canaletas', 'Canaletas para canal disipador — Parque Fotovoltaico Concorde', 'Vial'],
	['ETC/Durmientes', 'Durmientes', 'Vial'],
	['ETC/Sumideros', 'Sumideros', 'Vial'],
	['ETC/Power china-20260811T172212Z-1-001', 'Power China', 'Infraestructura industrial'],
	['ETC/Cerco bulldog', 'Cerco bulldog — Subestación Jadresic Antigua Parina', 'Fundaciones'],

	['FUNDACIONES/Cerco bull dock con diseño de fundaciones incorporados-20260811T172217Z-1-001', 'Cerco bulldog con fundaciones incorporadas', 'Fundaciones'],
	['FUNDACIONES/Fabricación de Dados Prefabricados División Gabriela Mistral - Codelco', 'Dados prefabricados — Codelco División Gabriela Mistral', 'Fundaciones'],
	['FUNDACIONES/Fundaciones - PCS', 'Fundaciones con pedestal para PCS — BESS Sol de los Andes', 'Fundaciones'],
	['FUNDACIONES/Fundaciones con Insertos', 'Fundaciones con insertos', 'Fundaciones'],
	['FUNDACIONES/Fundaciones de contenedores de baterías - BESS01', 'Fundaciones para contenedores de baterías — BESS', 'Fundaciones'],
	['FUNDACIONES/Fundaciones de Parrayos y Parrones - Bess Atacama', 'Fundaciones de pararrayos y parrones — BESS Atacama', 'Fundaciones'],
	['FUNDACIONES/Fundaciones Prefabricadas para Sala Eléctrica Agrosonda  Bess Atacama', 'Fundaciones para sala eléctrica Agrosonda — BESS Atacama', 'Fundaciones'],
	['FUNDACIONES/Fundaciones y Canaletas - Bess Atacama-', 'Fundaciones y canaletas — BESS Atacama', 'Fundaciones'],
	['FUNDACIONES/Losas de Fundación - Bess-20260810T191420Z-1-001', 'Losas de fundación — BESS', 'Fundaciones'],
	['FUNDACIONES/_bess copihue- Fundaciones para contenedores de baterias-', 'Fundaciones para contenedores de baterías — BESS Copihue', 'Fundaciones'],
];

const slugify = (t) =>
	t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Falla temprano si una carpeta cambio de nombre, en vez de saltarsela callado.
const faltantes = PROYECTOS.filter(([d]) => !fs.existsSync(path.join(RAIZ, d)));
if (faltantes.length) {
	console.error('carpetas no encontradas:');
	faltantes.forEach(([d]) => console.error('  ' + d));
	process.exit(1);
}

const [{ max }] = await sql`select coalesce(max(sort_order), 0) as max from projects`;
let orden = Number(max);
let n = 0;

if (APPLY) fs.mkdirSync(DESTINO, { recursive: true });

for (const [dir, titulo, categoria] of PROYECTOS) {
	const fotos = fs.readdirSync(path.join(RAIZ, dir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
	const origen = path.join(RAIZ, dir, fotos[0]);
	const meta = await sharp(origen).metadata();

	let slug = slugify(titulo);
	const [ocupado] = await sql`select 1 from projects where slug = ${slug}`;
	if (ocupado) slug = `${slug}-2`;

	const destino = `/img/proyectos/${slug}.webp`;
	orden += 1;
	n += 1;

	console.log(
		`${String(n).padStart(2)}. ${titulo}\n` +
		`    ${categoria} | ${fotos[0]} (${meta.width}x${meta.height}, ${fotos.length} disponibles) -> ${destino}`
	);

	if (APPLY) {
		const buf = await sharp(origen).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
		fs.writeFileSync('public' + destino, buf);
		await sql`
			INSERT INTO projects (title, slug, category, location, bullets, image_url, image_alt, published, sort_order)
			VALUES (${titulo}, ${slug}, ${categoria}, ${''}, ${sql.json([])}, ${destino}, ${titulo}, ${true}, ${orden})
			ON CONFLICT (slug) DO NOTHING
		`;
	}
}

console.log(`\n${n} proyectos` + (APPLY ? ' importados.' : ' listos (dry-run; usar --apply para escribir)'));
await sql.end();
