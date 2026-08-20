// Crea (o actualiza la contraseña de) un usuario admin del panel.
// Uso: node --env-file=.env.local scripts/create-admin-user.mjs correo@cliente.cl "contraseña segura"

import postgres from 'postgres';
import { randomBytes, scryptSync } from 'node:crypto';

const [email, password] = process.argv.slice(2);
if (!email || !password) {
	console.error('Uso: node --env-file=.env.local scripts/create-admin-user.mjs <email> <password>');
	process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const passwordHash = `${salt}:${hash}`;

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

await sql`
	INSERT INTO admin_users (email, password_hash)
	VALUES (${email}, ${passwordHash})
	ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
`;

console.log(`✓ Usuario admin listo: ${email}`);
await sql.end();
