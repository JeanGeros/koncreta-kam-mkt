-- Ejecutar una sola vez contra la base de datos de producción/desarrollo.
-- psql "$DATABASE_URL" -f scripts/schema.sql

CREATE TABLE IF NOT EXISTS admin_users (
	id SERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	category TEXT NOT NULL,
	location TEXT NOT NULL,
	bullets JSONB NOT NULL DEFAULT '[]',
	image_url TEXT,
	image_alt TEXT,
	published BOOLEAN NOT NULL DEFAULT true,
	sort_order INT NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	category TEXT NOT NULL,
	excerpt TEXT NOT NULL,
	content TEXT NOT NULL,
	hero_image_url TEXT,
	hero_image_alt TEXT,
	featured BOOLEAN NOT NULL DEFAULT false,
	published BOOLEAN NOT NULL DEFAULT true,
	published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
