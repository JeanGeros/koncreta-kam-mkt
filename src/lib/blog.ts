import { sql } from './db';
import { uniqueSlug } from './slugify';

export type BlogPost = {
	id: number;
	title: string;
	slug: string;
	category: string;
	excerpt: string;
	content: string;
	hero_image_url: string | null;
	hero_image_alt: string | null;
	featured: boolean;
	published: boolean;
	published_at: string;
	created_at: string;
	updated_at: string;
};

export type BlogPostInput = {
	title: string;
	category: string;
	excerpt: string;
	content: string;
	hero_image_url: string | null;
	hero_image_alt: string | null;
	featured: boolean;
	published: boolean;
};

export async function getBlogHome(): Promise<{ featured: BlogPost | null; rest: BlogPost[] }> {
	const posts = (await sql`
		SELECT * FROM blog_posts WHERE published = true
		ORDER BY featured DESC, published_at DESC
	`) as BlogPost[];
	const [featured, ...rest] = posts;
	return { featured: featured ?? null, rest };
}

export async function getAllPosts(): Promise<BlogPost[]> {
	return (await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`) as BlogPost[];
}

export async function getPostById(id: number): Promise<BlogPost | null> {
	const rows = (await sql`SELECT * FROM blog_posts WHERE id = ${id}`) as BlogPost[];
	return rows[0] ?? null;
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
	const rows = (await sql`
		SELECT * FROM blog_posts WHERE slug = ${slug} AND published = true
	`) as BlogPost[];
	return rows[0] ?? null;
}

async function postSlugExists(slug: string, excludeId?: number): Promise<boolean> {
	const rows = (await sql`
		SELECT 1 FROM blog_posts WHERE slug = ${slug} AND id IS DISTINCT FROM ${excludeId ?? null}
	`) as unknown[];
	return rows.length > 0;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
	const slug = await uniqueSlug(input.title, (s) => postSlugExists(s));
	const rows = (await sql`
		INSERT INTO blog_posts (title, slug, category, excerpt, content, hero_image_url, hero_image_alt, featured, published)
		VALUES (${input.title}, ${slug}, ${input.category}, ${input.excerpt}, ${input.content},
		        ${input.hero_image_url}, ${input.hero_image_alt}, ${input.featured}, ${input.published})
		RETURNING *
	`) as BlogPost[];
	return rows[0];
}

export async function updatePost(id: number, input: BlogPostInput): Promise<BlogPost | null> {
	const rows = (await sql`
		UPDATE blog_posts SET
			title = ${input.title},
			category = ${input.category},
			excerpt = ${input.excerpt},
			content = ${input.content},
			hero_image_url = ${input.hero_image_url},
			hero_image_alt = ${input.hero_image_alt},
			featured = ${input.featured},
			published = ${input.published},
			updated_at = now()
		WHERE id = ${id}
		RETURNING *
	`) as BlogPost[];
	return rows[0] ?? null;
}

export async function deletePost(id: number): Promise<void> {
	await sql`DELETE FROM blog_posts WHERE id = ${id}`;
}
