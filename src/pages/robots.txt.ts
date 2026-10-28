import type { APIContext } from 'astro';

// sitemap 주소가 배포 도메인(site)을 따라가도록 정적 파일 대신 빌드 시 생성한다.
export function GET(context: APIContext) {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap.xml`, context.site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
