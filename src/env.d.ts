/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly BLOB_READ_WRITE_TOKEN: string;
	readonly SESSION_SECRET: string;
	readonly PUBLIC_TURNSTILE_SITE_KEY: string;
	readonly TURNSTILE_SECRET_KEY: string;
	readonly SMTP_HOST: string;
	readonly SMTP_PORT?: string;
	readonly SMTP_USER: string;
	readonly SMTP_PASS: string;
	readonly CONTACT_TO: string;
	readonly CONTACT_FROM?: string;
	/** Solo para dev local, ver src/middleware.ts */
	readonly ADMIN_DEV_BYPASS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

type AdminUser = {
	id: number;
	email: string;
};

declare namespace App {
	interface Locals {
		user: AdminUser | null;
	}
}
