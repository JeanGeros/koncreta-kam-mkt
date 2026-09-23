// Repone en el cuerpo de cada post las imágenes que muestra el original de Wix.
//
// No adivina con regex sueltos: recorre el cuerpo Ricos (post-description ->
// bloques rcv-block) y toma el media id de cada figura, así que no se le escapan
// formatos como .webp ni confunde un banner CTA con contenido.
//
// Sobre la portada repetida: en Wix la portada salía dos veces, como banner
// arriba y otra vez dentro del texto. Mientras el layout tuvo banner, reponer la
// del cuerpo habría duplicado la foto. Sin banner (ver BlogPost.astro) el post
// queda sin ninguna imagen, así que esa copia sí va — y reutiliza el archivo de
// la portada que ya está en public/img/, sin descargar ni pesar de nuevo.
//
// Uso:
//   node --env-file=.env.local scripts/exportar-imagenes-wix.mjs            (dry-run)
//   node --env-file=.env.local scripts/exportar-imagenes-wix.mjs --apply
import fs from 'node:fs';
import postgres from 'postgres';
import sharp from 'sharp';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const APPLY = process.argv.includes('--apply');
const UA = { 'user-agent': 'Mozilla/5.0' };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const kb = (n) => (n / 1024).toFixed(0) + 'KB';

const norm = (s) => {
	let d = s;
	try { d = decodeURIComponent(s); } catch { /* slug mal codificado en el sitemap */ }
	return d.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
};
const limpiar = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// El mapa de redirecciones ya empareja cada slug nuestro con el de Wix.
const redir = fs.readFileSync('src/pages/post/[...slug].astro', 'utf8');
const porNuevo = new Map([...redir.matchAll(/^\t'([^']+)':\n\t\t'([^']+)',/gm)].map((m) => [m[2], m[1]]));
const sitemap = await fetch('https://www.koncretaprefabricados.cl/blog-posts-sitemap.xml', { headers: UA }).then((r) => r.text());
const porViejo = new Map(
	[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => [norm(m[1].split('/post/')[1] || ''), m[1]])
);

// Wix corta las peticiones seguidas con una página de verificación.
async function traer(url, intentos = 5) {
	for (let i = 0; i < intentos; i++) {
		const html = await fetch(encodeURI(url), { headers: UA }).then((r) => r.text());
		if (!/verify your request/.test(html)) return html;
		await dormir(10000 * (i + 1));
	}
	return null;
}

// Nodos del cuerpo en orden: texto e imágenes ya clasificadas.
function nodos(html, heroId) {
	const i = html.indexOf('data-hook="post-description"');
	if (i < 0) return [];
	const j = html.indexOf('data-hook="post-footer"', i);
	const body = html.slice(i, j > 0 ? j : undefined);
	const marcas = [...body.matchAll(/data-hook="rcv-block(?:-first|-last|\d+)"/g)].map((m) => m.index);
	const out = [];
	// Un rcv-block NO es atómico: puede traer texto, una figura y más texto (por
	// ejemplo una lista con la imagen en medio). Tratarlo como una unidad pierde
	// el orden interno y la imagen termina colocada antes de tiempo. Hay que
	// partirlo en los límites de cada figura.
	const texto = (s) => limpiar(s.replace(/^[^<]*>/, ''));
	for (let k = 0; k < marcas.length; k++) {
		const seg = body.slice(marcas[k], marcas[k + 1] ?? body.length);
		const figs = [...seg.matchAll(/data-hook="figure-IMAGE"/g)].map((m) => m.index);
		let pos = 0;
		for (let f = 0; f < figs.length; f++) {
			const t = texto(seg.slice(pos, figs[f]));
			if (t.length > 25) out.push({ tipo: 'texto', t });
			const hasta = figs[f + 1] ?? seg.length;
			// Ojo: NO descartar las figuras enlazadas a WhatsApp. Parecen banners
			// CTA, pero las 6 del blog son fotos reales (3:2 o 4:3, grandes) que van
			// tras el párrafo de intro, con el enlace encima. Descartarlas dejaba
			// posts enteros sin una sola imagen. El CTA de verdad es un
			// <div type="button">, que no es figure-IMAGE y nunca entra acá.
			const id = (/\/media\/([0-9a-f]{6,8}_[0-9a-f]{32}~mv2\.[a-z0-9]+)/i.exec(seg.slice(figs[f], hasta)) || [])[1];
			if (id) out.push({ tipo: 'img', id, esPortada: id === heroId });
			pos = figs[f] + 1;
		}
		const t = texto(seg.slice(pos));
		if (t.length > 25) out.push({ tipo: 'texto', t });
	}
	return out;
}

const bajados = new Map();
async function bajar(id) {
	if (!bajados.has(id)) {
		const buf = Buffer.from(await fetch(`https://static.wixstatic.com/media/${id}`, { headers: UA }).then((r) => r.arrayBuffer()));
		bajados.set(id, { buf, meta: await sharp(buf).metadata() });
	}
	return bajados.get(id);
}

// Ubica la figura en nuestro contenido usando el texto que la precede en Wix.
// Devuelve el índice del bloque tras el cual va, -1 si va al principio, o null
// si no se pudo anclar.
function ubicar(seq, fig, bloques) {
	const k = seq.indexOf(fig);
	const prev = seq.slice(0, k).reverse().find((x) => x.tipo === 'texto');
	if (!prev) return -1; // la imagen abre el post
	// Wix escribe las listas como texto plano ("4. Integración...", "- Uso de...")
	// y en nuestro HTML son <li>, sin la marca. Hay que sacarla de los dos lados
	// o el ancla nunca calza contra un ítem de lista.
	const sinMarca = (s) => s.replace(/^\s*(?:\d+[.)]|[-–—•*])\s*/, '');
	const ref = norm(sinMarca(prev.t));
	const textos = bloques.map((b) => norm(sinMarca(limpiar(b))));
	for (const largo of [45, 30, 20]) {
		const ancla = ref.slice(0, largo);
		if (!ancla) continue;
		let i = textos.findIndex((t) => t.startsWith(ancla));
		if (i < 0) i = textos.findIndex((t) => t.includes(ancla));
		if (i >= 0) return i;
	}
	return null;
}

const nombreDe = (id) => 'wix-' + id.split('_')[1].slice(0, 12) + '.' + id.split('~mv2.')[1];

const posts = await sql`select id, slug, title, content, hero_image_url, hero_image_alt from blog_posts order by id`;
let nuevas = 0, reusadas = 0, sinAncla = 0, pesoNuevo = 0;

for (const p of posts) {
	const url = porViejo.get(norm(porNuevo.get(p.slug) || ''));
	if (!url) { console.log(`#${p.id} SIN URL DE ORIGEN — omitido`); continue; }
	const html = await traer(url);
	if (!html) { console.log(`#${p.id} Wix bloqueó la lectura — omitido`); continue; }

	// La sección post-hero-image viene vacía en el SSR; og:image sí trae el id de la portada.
	const heroId = (/<meta property="og:image" content="[^"]*\/media\/([0-9a-f]{6,8}_[0-9a-f]{32}~mv2\.[a-z0-9]+)/i.exec(html) || [])[1] || null;
	const seq = nodos(html, heroId);
	const figuras = seq.filter((x) => x.tipo === 'img' && !x.cta);
	if (!figuras.length) continue;

	// Se sacan las <img> del contenido y se vuelven a colocar todas desde cero:
	// así también se corrige una que ya estaba pero mal ubicada, no solo las que
	// faltan. Dos posts la traen dentro del párrafo, por eso se extrae con replace
	// en vez de descartar la línea entera.
	const previas = new Map(); // dimensiones -> archivo que ya teníamos
	for (const m of p.content.matchAll(/<img[^>]+src="([^"]+)"/g)) {
		const ruta = 'public' + m[1];
		if (!fs.existsSync(ruta)) continue;
		const d = await sharp(ruta).metadata();
		previas.set(`${d.width}x${d.height}`, m[1]);
	}
	const bloques = p.content
		.split('\n')
		.map((b) => b.replace(/<img[^>]*>/g, '').trim())
		.filter((b) => limpiar(b).length > 0);

	const plan = [];
	for (const fig of figuras) {
		const o = await bajar(fig.id);
		const clave = `${o.meta.width}x${o.meta.height}`;
		const heroLocal = 'public' + p.hero_image_url;
		let ruta = previas.get(clave) ?? null;
		let alt = p.title, estado = ruta ? 'ok' : null;

		if (!ruta && fig.esPortada && fs.existsSync(heroLocal)) {
			const hm = await sharp(heroLocal).metadata();
			if (hm.width === o.meta.width && hm.height === o.meta.height) {
				ruta = p.hero_image_url;
				alt = p.hero_image_alt || p.title;
				estado = 'reusa';
			}
		}
		if (!ruta) { ruta = '/img/' + nombreDe(fig.id); estado = 'baja'; }

		const pos = ubicar(seq, fig, bloques);
		if (pos === null) { console.log(`#${p.id} ${fig.id} SIN ANCLA — omitida`); sinAncla++; continue; }
		plan.push({ id: fig.id, buf: o.buf, ruta, alt, pos, estado, meta: o.meta });
	}
	if (!plan.length) continue;

	// ¿Cambia algo respecto de lo que ya está escrito?
	const antes = p.content.split('\n').filter(Boolean);
	const salida = [...bloques];
	for (const i of [...plan].sort((a, b) => b.pos - a.pos)) {
		salida.splice(i.pos + 1, 0, `<img src="${i.ruta}" alt="${i.alt.replace(/"/g, '&quot;')}">`);
	}
	const cambia = salida.join('\n') !== antes.join('\n');
	if (!cambia) continue;

	console.log(`\n#${p.id} ${p.slug.slice(0, 52)}`);
	for (const i of plan) {
		const etq = i.estado === 'baja' ? 'BAJA ' : i.estado === 'reusa' ? 'reusa' : 'mueve';
		console.log(`   ${etq} ${i.ruta}  ${i.meta.width}x${i.meta.height} ${kb(i.buf.length)}  ${i.pos < 0 ? 'al inicio' : `tras "${limpiar(bloques[i.pos]).slice(0, 52)}"`}`);
		if (i.estado === 'baja') { nuevas++; pesoNuevo += i.buf.length; } else if (i.estado === 'reusa') reusadas++; else movidas++;
	}

	if (APPLY) {
		for (const i of plan) if (i.estado === 'baja') fs.writeFileSync('public' + i.ruta, i.buf);
		await sql`update blog_posts set content = ${salida.join('\n')}, updated_at = now() where id = ${p.id}`;
	}
	await dormir(2500);
}

console.log(`\n${APPLY ? 'aplicado' : 'dry-run'}: ${reusadas} reutilizadas (0 peso) + ${nuevas} descargadas (${kb(pesoNuevo)})${sinAncla ? `, ${sinAncla} sin ancla` : ''}`);
if (!APPLY) console.log('(usar --apply para escribir)');
await sql.end();
