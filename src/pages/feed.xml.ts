import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/config';
import { getPosts } from '@/lib/posts';
import { postUrl } from '@/lib/url';

const FEED_LIMIT = 20;

export async function GET(context: APIContext) {
  const posts = (await getPosts()).slice(0, FEED_LIMIT);
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(import.meta.env.BASE_URL, context.site),
    customData: `<language>${SITE.locale.split('-')[0]}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: postUrl(post.id),
    })),
  });
}
