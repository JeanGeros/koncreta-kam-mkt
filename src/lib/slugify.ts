export function slugify(title: string): string {
	return title
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '') // quita acentos
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Agrega -2, -3... hasta encontrar un slug libre. `exists` consulta la DB. */
export async function uniqueSlug(
	title: string,
	exists: (slug: string) => Promise<boolean>,
): Promise<string> {
	const base = slugify(title) || 'item';
	let slug = base;
	let n = 2;
	while (await exists(slug)) {
		slug = `${base}-${n}`;
		n++;
	}
	return slug;
}
