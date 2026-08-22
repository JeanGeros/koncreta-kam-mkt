// Migra los 21 posts restantes del blog de Wix (los 4 primeros ya están en seed-blog-posts.mjs).
// Ejecutar una sola vez: node --env-file=.env.local scripts/seed-blog-posts-wix.mjs
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });
const posts = JSON.parse(readFileSync(new URL('./blog-posts-wix-data.json', import.meta.url), 'utf8'));

function slugify(title) {
	return title
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

for (const p of posts) {
	const slug = slugify(p.title);
	await sql`
		INSERT INTO blog_posts (title, slug, category, excerpt, content, hero_image_url, hero_image_alt, featured, published, published_at)
		VALUES (${p.title}, ${slug}, ${p.category}, ${p.excerpt}, ${p.content},
		        ${p.hero_image_url}, ${p.hero_image_alt}, ${p.featured}, true, ${p.published_at})
		ON CONFLICT (slug) DO NOTHING
	`;
	console.log(`✓ ${p.title}`);
}

console.log(`Listo: ${posts.length} posts procesados.`);
await sql.end();
