export type AdminUser = {
	id: number;
	email: string;
	password_hash: string;
	created_at: string;
};

export type Project = {
	id: number;
	title: string;
	slug: string;
	category: string;
	location: string;
	bullets: string[];
	image_url: string | null;
	image_alt: string | null;
	published: boolean;
	sort_order: number;
	created_at: string;
	updated_at: string;
};

export type ProjectInput = {
	title: string;
	category: string;
	location: string;
	bullets: string[];
	image_url: string | null;
	image_alt: string | null;
	published: boolean;
	sort_order: number;
};

export type BlogPost = {
	id: number;
	title: string;
	slug: string;
	category: string;
	excerpt: string;
	content: string;
	hero_image_url: string | null;
	hero_image_alt: string | null;
	featured: boolean;
	published: boolean;
	published_at: string;
	created_at: string;
	updated_at: string;
};

export type BlogPostInput = {
	title: string;
	category: string;
	excerpt: string;
	content: string;
	hero_image_url: string | null;
	hero_image_alt: string | null;
	featured: boolean;
	published: boolean;
};
