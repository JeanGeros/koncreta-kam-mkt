import postgres from 'postgres';

// Lazy: evita romper el build/prerender de páginas estáticas que no
// necesitan DB (la conexión solo se abre cuando una query realmente corre).
let client: ReturnType<typeof postgres> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
	// prepare:false porque muchos proveedores (ej. Supabase) exponen la DB
	// detrás de un pooler tipo PgBouncer en modo transacción, que no soporta
	// prepared statements.
	// ponytail: process.env primero — import.meta.env se inlinea en build, así que
	// en Vercel queda congelado (o undefined) si la var no estaba al construir.
	if (!client) {
		const url = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
		if (!url) throw new Error('Falta DATABASE_URL en el entorno');
		client = postgres(url, { ssl: 'require', prepare: false });
	}
	return (client as (s: TemplateStringsArray, ...v: unknown[]) => unknown)(strings, ...values);
}
