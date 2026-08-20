import { sql } from './db';

export type AdminUserRow = {
	id: number;
	email: string;
	password_hash: string;
};

export async function getUserByEmail(email: string): Promise<AdminUserRow | null> {
	const rows = (await sql`SELECT * FROM admin_users WHERE email = ${email}`) as AdminUserRow[];
	return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<AdminUserRow | null> {
	const rows = (await sql`SELECT * FROM admin_users WHERE id = ${id}`) as AdminUserRow[];
	return rows[0] ?? null;
}
