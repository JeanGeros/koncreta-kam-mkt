// Borra los 7 proyectos de demostracion que sembro seed-projects.mjs, para
// dejar solo los importados desde la planilla.
//
// No toca los archivos de public/img: los k-*.jpg que usan estos proyectos
// tambien los usa el blog como portada, borrarlos romperia posts.
//
// Uso: node --env-file=.env.local scripts/borrar-proyectos-demo.mjs [--apply]
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const APPLY = process.argv.includes('--apply');

// Los de demo son los anteriores a la importacion: sin excepcion tienen
// ubicacion escrita, y los importados la tienen vacia.
const demo = await sql`select id, title, image_url from projects where location <> '' order by id`;

if (!demo.length) {
	console.log('no hay proyectos de demostracion que borrar.');
	await sql.end();
	process.exit(0);
}

console.log(`se borraran ${demo.length}:`);
for (const p of demo) console.log(`  #${p.id}  ${p.title}`);

const [{ c: restantes }] = await sql`select count(*)::int c from projects where location = ''`;
console.log(`\nquedarian ${restantes} proyectos (los importados de la planilla).`);

if (APPLY) {
	const ids = demo.map((p) => p.id);
	await sql`delete from projects where id = any(${ids})`;
	const [{ c }] = await sql`select count(*)::int c from projects`;
	console.log(`\nborrados. quedan ${c} proyectos.`);
} else {
	console.log('\n(dry-run; usar --apply para borrar)');
}
await sql.end();
