// Restaura las imágenes del cuerpo que la migración desde Wix perdió.
// Para cada post: lee el original en Wix, toma cada figura en orden, baja el
// archivo sin transform (resolución nativa) y la inserta en nuestro contenido
// después del párrafo que la precedía en el original.
// Uso: node --env-file=.env.local scripts/restaurar-imagenes-cuerpo.mjs [--apply] [--id N]
import fs from 'node:fs';
import postgres from 'postgres';
import sharp from 'sharp';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const UA = { 'user-agent': 'Mozilla/5.0' };
const APPLY = process.argv.includes('--apply');
const SOLO = process.argv.includes('--id') ? Number(process.argv[process.argv.indexOf('--id') + 1]) : null;

const wix = JSON.parse(fs.readFileSync('scripts/blog-posts-wix-data.json', 'utf8'));
const porHero = new Map((Array.isArray(wix) ? wix : wix.posts).map((w) => [w.hero_image_url, w.source_url]));
const sitemap = await fetch('https://www.koncretaprefabricados.cl/blog-posts-sitemap.xml', { headers: UA }).then((r) =>
	r.text()
);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const norm = (s) => {
	let d = s;
	try { d = decodeURIComponent(s); } catch { /* slug mal codificado en el sitemap */ }
	return d.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
};

const limpiar = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Recorre la página en orden y devuelve [{tipo:'texto'|'img', ...}] del cuerpo.
function secuencia(html) {
	const re = /<figure class="[^"]*" data-hook="figure-IMAGE"|<p class="[^"]*"[^>]*>([\s\S]{0,1500}?)<\/p>|<h([1-6])[^>]*>([\s\S]{0,400}?)<\/h\2>/g;
	const out = [];
	let m;
	while ((m = re.exec(html))) {
		if (m[0].startsWith('<figure')) {
			// Ventana amplia: algunas figuras van envueltas en un <a> que empuja el id.
			const seg = html.slice(m.index, m.index + 1400);
			const id = (/e881e7_[0-9a-f]{32}~mv2\.(?:jpe?g|png)/.exec(seg) || [])[0];
			const ancho = /vMxPm/.test(html.slice(Math.max(0, m.index - 140), m.index));
			// Las figuras enlazadas a WhatsApp son banners CTA de Wix, no contenido.
			const cta = /api\.whatsapp\.com/.test(seg.slice(0, 400));
			if (id) out.push({ tipo: 'img', id, angosta: ancho, cta });
		} else {
			const t = limpiar(m[1] ?? m[3] ?? '');
			if (t.length > 25) out.push({ tipo: 'texto', t });
		}
	}
	return out;
}

const posts = await sql`select id, slug, title, content, hero_image_url from blog_posts order by id`;
let totalInsertadas = 0;

for (const p of posts) {
	if (SOLO && p.id !== SOLO) continue;
	if ((p.content.match(/<img/gi) || []).length > 0) continue; // ya tiene, no tocar
	const url = porHero.get(p.hero_image_url) || urls.find((u) => norm(u.split('/post/')[1] || '').startsWith(norm(p.slug).slice(0, 40)));
	if (!url) { console.log(`#${p.id} SIN URL DE ORIGEN — omitido`); continue; }

	const html = await fetch(encodeURI(url), { headers: UA }).then((r) => r.text());
	const seq = secuencia(html);
	const imgs = seq.filter((x) => x.tipo === 'img' && !x.cta);
	const ctas = seq.filter((x) => x.tipo === 'img' && x.cta).length;
	if (ctas) console.log(`#${p.id} (${ctas} banner CTA de WhatsApp omitido)`);
	if (!imgs.length) { console.log(`#${p.id} sin imágenes en el original`); continue; }

	const blocks = p.content.split('\n').filter(Boolean);
	const inserciones = [];

	for (const [n, img] of imgs.entries()) {
		// Texto que la precede en el original -> ancla para ubicarla en el nuestro.
		const k = seq.indexOf(img);
		const prev = seq.slice(0, k).reverse().find((x) => x.tipo === 'texto');
		const ancla = prev ? norm(prev.t).slice(0, 45) : null;
		const pos = ancla ? blocks.findIndex((b) => norm(limpiar(b)).startsWith(ancla)) : -1;

		const ext = img.id.endsWith('.png') ? 'png' : 'jpg';
		const nombre = `/img/post${p.id}-${n + 1}.${ext}`;
		const buf = Buffer.from(await fetch(`https://static.wixstatic.com/media/${img.id}`, { headers: UA }).then((r) => r.arrayBuffer()));
		const meta = await sharp(buf).metadata();
		// Varios posts repiten la portada dentro del cuerpo; insertarla la duplicaría.
		const heroPath = 'public' + p.hero_image_url;
		const hero = fs.existsSync(heroPath) ? await sharp(heroPath).metadata() : null;
		if (hero && hero.width === meta.width && hero.height === meta.height) {
			console.log(`    (omitida: duplica la portada, ${meta.width}x${meta.height})`);
			continue;
		}
		inserciones.push({ nombre, buf, meta, pos, angosta: img.angosta, ancla: prev?.t.slice(0, 50) });
	}

	// Insertar de atrás hacia adelante para no correr los índices previos.
	const salida = [...blocks];
	for (const ins of [...inserciones].sort((a, b) => b.pos - a.pos)) {
		if (ins.pos < 0) continue;
		// Wix guarda alt="" en origen: no hay nada que importar. El título es un
		// fallback razonable; conviene afinarlo a mano desde el admin.
		const alt = p.title.replace(/"/g, '&quot;');
		salida.splice(ins.pos + 1, 0, `<img src="${ins.nombre}" alt="${alt}">`);
	}

	const ok = inserciones.filter((i) => i.pos >= 0);
	console.log(`#${p.id} ${p.slug.slice(0, 38)} — ${ok.length}/${inserciones.length} ubicadas`);
	for (const i of inserciones) {
		console.log(`    ${i.nombre}  ${i.meta.width}x${i.meta.height}  ${i.pos >= 0 ? `tras bloque ${i.pos}` : 'SIN ANCLA'}  "${i.ancla ?? ''}"`);
	}

	if (APPLY) {
		for (const i of ok) fs.writeFileSync('public' + i.nombre, i.buf);
		await sql`update blog_posts set content = ${salida.join('\n')} where id = ${p.id}`;
		totalInsertadas += ok.length;
	}
}

console.log(APPLY ? `\naplicado: ${totalInsertadas} imágenes` : '\n(dry-run; usar --apply para escribir)');
await sql.end();
