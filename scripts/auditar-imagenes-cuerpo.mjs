// Solo lectura: compara cuántas imágenes tiene el cuerpo de cada post en la base
// contra cuántas tiene el post original en Wix. La migración perdió varias.
// Uso: node --env-file=.env.local scripts/auditar-imagenes-cuerpo.mjs
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const UA = { 'user-agent': 'Mozilla/5.0' };

const sitemap = await fetch('https://www.koncretaprefabricados.cl/blog-posts-sitemap.xml', { headers: UA }).then((r) =>
	r.text()
);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// Normaliza para emparejar el slug nuestro con el de Wix (tildes, guiones).
const norm = (s) =>
	decodeURIComponent(s)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]/g, '');

// El JSON de migración trae el source_url exacto; emparejar por slug contra el
// sitemap falla porque Wix trunca los slugs largos.
const fs = await import('node:fs');
const wix = JSON.parse(fs.readFileSync('scripts/blog-posts-wix-data.json', 'utf8'));
const porHero = new Map((Array.isArray(wix) ? wix : wix.posts).map((w) => [w.hero_image_url, w.source_url]));

const posts = await sql`select id, slug, content, hero_image_url from blog_posts order by id`;
const filas = [];

for (const p of posts) {
	const propias = (p.content.match(/<img/gi) || []).length;
	const url =
		porHero.get(p.hero_image_url) ||
		urls.find((u) => norm(u.split('/post/')[1] || '').startsWith(norm(p.slug).slice(0, 40)));
	let enWix = null;
	if (url) {
		try {
			const html = await fetch(encodeURI(url), { headers: UA }).then((r) => r.text());
			// Cada imagen del cuerpo Ricos es un figure-IMAGE; las demás son UI del sitio.
			enWix = (html.match(/figure-IMAGE/g) || []).length;
		} catch {}
	}
	filas.push({ id: p.id, slug: p.slug.slice(0, 44), propias, enWix, url });
	process.stderr.write('.');
}
process.stderr.write('\n');

console.log('id  base  wix  slug');
for (const f of filas) {
	const falta = f.enWix !== null && f.enWix > f.propias;
	console.log(
		String(f.id).padStart(2) + '  ' + String(f.propias).padStart(4) + '  ' +
		String(f.enWix ?? '?').padStart(3) + '  ' + f.slug + (falta ? `   <-- faltan ${f.enWix - f.propias}` : '') +
		(f.url ? '' : '   (sin match en sitemap)')
	);
}
const totalFaltan = filas.filter((f) => f.enWix !== null && f.enWix > f.propias);
console.log(`\nposts con imágenes faltantes: ${totalFaltan.length} de ${filas.length}`);
console.log(`imágenes perdidas en total: ${totalFaltan.reduce((s, f) => s + (f.enWix - f.propias), 0)}`);
await sql.end();
