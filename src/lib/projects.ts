import { sql } from './db';
import { uniqueSlug } from './slugify';

export type Project = {
	id: number;
	title: string;
	slug: string;
	category: string;
	location: string;
	bullets: string[];
	image_url: string | null;
	image_alt: string | null;
	published: boolean;
	sort_order: number;
	created_at: string;
	updated_at: string;
};

export type ProjectInput = {
	title: string;
	category: string;
	location: string;
	bullets: string[];
	image_url: string | null;
	image_alt: string | null;
	published: boolean;
	sort_order: number;
};

// El pooler de algunos proveedores (ej. Supabase en modo transacción) hace
// que jsonb vuelva como string en vez de ya parseado. Normalizamos acá.
function normalize(row: any): Project {
	return { ...row, bullets: Array.isArray(row.bullets) ? row.bullets : JSON.parse(row.bullets) };
}

export async function getPublishedProjects(): Promise<Project[]> {
	const rows = (await sql`
		SELECT * FROM projects WHERE published = true
		ORDER BY sort_order ASC, created_at DESC
	`) as any[];
	return rows.map(normalize);
}

export async function getAllProjects(): Promise<Project[]> {
	const rows = (await sql`SELECT * FROM projects ORDER BY created_at DESC`) as any[];
	return rows.map(normalize);
}

export async function getProjectById(id: number): Promise<Project | null> {
	const rows = (await sql`SELECT * FROM projects WHERE id = ${id}`) as any[];
	return rows[0] ? normalize(rows[0]) : null;
}

async function projectSlugExists(slug: string, excludeId?: number): Promise<boolean> {
	const rows = (await sql`
		SELECT 1 FROM projects WHERE slug = ${slug} AND id IS DISTINCT FROM ${excludeId ?? null}
	`) as unknown[];
	return rows.length > 0;
}

export async function createProject(input: ProjectInput): Promise<Project> {
	const slug = await uniqueSlug(input.title, (s) => projectSlugExists(s));
	const bulletsJson = JSON.stringify(input.bullets);
	const rows = (await sql`
		INSERT INTO projects (title, slug, category, location, bullets, image_url, image_alt, published, sort_order)
		VALUES (${input.title}, ${slug}, ${input.category}, ${input.location}, ${bulletsJson}::jsonb,
		        ${input.image_url}, ${input.image_alt}, ${input.published}, ${input.sort_order})
		RETURNING *
	`) as any[];
	return normalize(rows[0]);
}

export async function updateProject(id: number, input: ProjectInput): Promise<Project | null> {
	const bulletsJson = JSON.stringify(input.bullets);
	const rows = (await sql`
		UPDATE projects SET
			title = ${input.title},
			category = ${input.category},
			location = ${input.location},
			bullets = ${bulletsJson}::jsonb,
			image_url = ${input.image_url},
			image_alt = ${input.image_alt},
			published = ${input.published},
			sort_order = ${input.sort_order},
			updated_at = now()
		WHERE id = ${id}
		RETURNING *
	`) as any[];
	return rows[0] ? normalize(rows[0]) : null;
}

export async function deleteProject(id: number): Promise<void> {
	await sql`DELETE FROM projects WHERE id = ${id}`;
}
