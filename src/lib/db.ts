import { neon } from '@neondatabase/serverless';

// Lazy: evita romper el build/prerender de páginas estáticas que no
// necesitan DB (la conexión solo se abre cuando una query realmente corre).
let client: ReturnType<typeof neon> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
	if (!client) client = neon(import.meta.env.DATABASE_URL);
	return client(strings, ...values);
}
