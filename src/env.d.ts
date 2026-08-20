/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly BLOB_READ_WRITE_TOKEN: string;
	readonly SESSION_SECRET: string;
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
