import { sql } from './db';
import type { AdminUser } from '../types';

export type AdminUserRow = AdminUser;
export type { AdminUser };


export async function getUserByEmail(email: string): Promise<AdminUserRow | null> {
	const rows = (await sql`SELECT * FROM admin_users WHERE email = ${email}`) as AdminUserRow[];
	return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<AdminUserRow | null> {
	const rows = (await sql`SELECT * FROM admin_users WHERE id = ${id}`) as AdminUserRow[];
	return rows[0] ?? null;
}
