// One-off: la migración desde Wix se comió las dos imágenes del cuerpo del post 1.
// Las reinserta reproduciendo el layout original (ver capturas del post en Wix):
//   - imagen vertical a la izquierda, sección "Sostenibilidad" a la derecha
//   - imagen horizontal centrada antes de "Innovaciones presentadas por empresas"
// Uso: node --env-file=.env.local scripts/fix-post-1-imagenes.mjs [--apply]
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const APPLY = process.argv.includes('--apply');

const [row] = await sql`select content from blog_posts where id = 1`;
if (row.content.includes('<img')) throw new Error('el contenido ya tiene imágenes — abortando para no duplicar');

const blocks = row.content.split('\n').filter(Boolean);
// Anclas por texto, no por índice: si el contenido cambia, falla en vez de
// escribir en el lugar equivocado.
const at = (needle) => {
	const i = blocks.findIndex((b) => b.includes(needle));
	if (i < 0) throw new Error(`ancla no encontrada: ${needle}`);
	return i;
};

const iSost = at('Sostenibilidad: el compromiso');
const iFicem = at('Desde la exposición del FICEM');
const iInnovEmpresas = at('Innovaciones presentadas por empresas del sector');
// La sección que va a la derecha de la imagen: el h2 y sus dos párrafos.
if (iFicem !== iSost + 2) throw new Error(`se esperaba h2 + 2 párrafos, hay ${iFicem - iSost}`);

const columnas =
	'<div data-columns>' +
	'<div data-column><img src="/img/k-congreso-1.jpg" alt="Presentación durante el 1° Congreso Nacional de Cemento y Hormigón"></div>' +
	`<div data-column>${blocks.slice(iSost, iFicem + 1).join('')}</div>` +
	'</div>';

const salida = [...blocks];
salida.splice(iSost, 3, columnas);
// Recalcular: el splice de arriba corrió los índices dos posiciones.
const iDestino = salida.findIndex((b) => b.includes('Innovaciones presentadas por empresas del sector'));
salida.splice(
	iDestino,
	0,
	'<img src="/img/k-congreso-2.jpg" alt="Innovaciones en prefabricados presentadas durante el congreso">'
);

const nuevo = salida.join('\n');
console.log(`bloques ${blocks.length} -> ${salida.length}, ${row.content.length} -> ${nuevo.length} chars`);
console.log(`columnas: imagen vertical | "${blocks[iSost].replace(/<[^>]+>/g, '').slice(0, 45)}" + 2 párrafos`);
console.log(`imagen horizontal insertada antes de "Innovaciones presentadas…" (posición ${iDestino})`);

if (APPLY) {
	await sql`update blog_posts set content = ${nuevo} where id = 1`;
	console.log('\nescrito en la base.');
} else {
	console.log('\n(dry-run; usar --apply para escribir)');
}
await sql.end();
