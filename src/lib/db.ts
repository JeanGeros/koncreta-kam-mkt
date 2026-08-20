import postgres from 'postgres';

// Lazy: evita romper el build/prerender de páginas estáticas que no
// necesitan DB (la conexión solo se abre cuando una query realmente corre).
let client: ReturnType<typeof postgres> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
	// prepare:false porque muchos proveedores (ej. Supabase) exponen la DB
	// detrás de un pooler tipo PgBouncer en modo transacción, que no soporta
	// prepared statements.
	if (!client) client = postgres(import.meta.env.DATABASE_URL, { ssl: 'require', prepare: false });
	return (client as (s: TemplateStringsArray, ...v: unknown[]) => unknown)(strings, ...values);
}
