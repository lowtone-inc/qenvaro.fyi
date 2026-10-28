import type { APIContext } from 'astro';
import { SITE } from '@/config';
import { getPosts, getTagGroups, paginate } from '@/lib/posts';
import { pageUrl, postUrl, tagUrl, withBase } from '@/lib/url';
import { isoDate } from '@/lib/format';

// 404 처럼 noindex 인 페이지는 뺀다. lastmod 는 글 발행/수정일.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  const pages = paginate(posts, SITE.postsPerPage).map((p) => ({ path: pageUrl(p.page) }));
  const entries = [
    ...pages,
    ...posts.map((post) => ({ path: postUrl(post.id), lastmod: isoDate(post.data.updatedDate ?? post.data.pubDate) })),
    { path: withBase('/tags/') },
    ...(await getTagGroups()).map((group) => ({ path: tagUrl(group.name) })),
    { path: withBase('/about/') },
  ];
  const urls = entries.map(
    ({ path, lastmod }: { path: string; lastmod?: string }) =>
      `<url><loc>${new URL(path, context.site).href}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
