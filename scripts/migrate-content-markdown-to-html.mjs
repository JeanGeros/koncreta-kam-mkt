// Convierte el content (Markdown) de blog_posts a HTML, una sola vez.
// Necesario porque el editor nuevo (TipTap) guarda/edita HTML directamente,
// en vez de Markdown parseado en el momento de renderizar con `marked`.
// Ejecutar una sola vez: node --env-file=.env.local scripts/migrate-content-markdown-to-html.mjs
import { marked } from 'marked';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

const posts = await sql`SELECT id, content FROM blog_posts`;
for (const post of posts) {
	const html = await marked.parse(post.content);
	await sql`UPDATE blog_posts SET content = ${html} WHERE id = ${post.id}`;
	console.log(`✓ post ${post.id} migrado a HTML`);
}

console.log(`Listo: ${posts.length} posts migrados.`);
await sql.end();
