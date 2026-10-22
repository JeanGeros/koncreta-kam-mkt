import rss from '@astrojs/rss';
import { CDN_CACHE, SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getBlogHome } from '../lib/blog';

export async function GET(context) {
	const { featured, rest } = await getBlogHome();
	const posts = featured ? [featured, ...rest] : rest;
	const res = await rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.excerpt,
			pubDate: new Date(post.published_at),
			link: `/blog/${post.slug}/`,
		})),
	});
	res.headers.set('Cache-Control', CDN_CACHE);
	return res;
}
