function readEnv(key: string): string | undefined {
	return process.env[key] || import.meta.env[key];
}

export const env = {
	get DATABASE_URL(): string {
		const val = readEnv('DATABASE_URL');
		if (!val) throw new Error('Falta DATABASE_URL en el entorno');
		return val;
	},
	get SUPABASE_URL(): string {
		return readEnv('SUPABASE_URL') || readEnv('PUBLIC_SUPABASE_URL') || '';
	},
	get SUPABASE_ANON_KEY(): string {
		return readEnv('SUPABASE_ANON_KEY') || readEnv('PUBLIC_SUPABASE_ANON_KEY') || '';
	},
	get SESSION_SECRET(): string {

		const val = readEnv('SESSION_SECRET');
		if (!val) {
			if (import.meta.env.DEV) return 'dev_session_secret_change_in_production_32_chars';
			throw new Error('Falta SESSION_SECRET en el entorno');
		}
		return val;
	},
	get BLOB_READ_WRITE_TOKEN(): string | undefined {
		return readEnv('BLOB_READ_WRITE_TOKEN');
	},
	get TURNSTILE_SECRET_KEY(): string {
		return readEnv('TURNSTILE_SECRET_KEY') ?? '';
	},
	get PUBLIC_TURNSTILE_SITE_KEY(): string {
		return readEnv('PUBLIC_TURNSTILE_SITE_KEY') ?? '';
	},
	get SMTP_HOST(): string {
		return readEnv('SMTP_HOST') ?? '';
	},
	get SMTP_PORT(): number {
		return Number(readEnv('SMTP_PORT') || 465);
	},
	get SMTP_USER(): string {
		return readEnv('SMTP_USER') ?? '';
	},
	get SMTP_PASS(): string {
		return readEnv('SMTP_PASS') ?? '';
	},
	get CONTACT_FROM(): string {
		return readEnv('CONTACT_FROM') || readEnv('SMTP_USER') || '';
	},
	get CONTACT_TO(): string {
		return readEnv('CONTACT_TO') || 'viveka.guarino@koncretaprefabricados.cl';
	},
	get MAINTENANCE_MODE(): boolean {
		return readEnv('MAINTENANCE_MODE') === 'true';
	},
};
