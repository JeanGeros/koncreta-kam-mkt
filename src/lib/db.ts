import postgres from 'postgres';

// Lazy: evita romper el build/prerender de páginas estáticas que no
// necesitan DB (la conexión solo se abre cuando una query realmente corre).
let client: ReturnType<typeof postgres> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
	if (!client) client = postgres(import.meta.env.DATABASE_URL, { ssl: 'require' });
	return (client as (s: TemplateStringsArray, ...v: unknown[]) => unknown)(strings, ...values);
}
