// @ts-check
import { defineConfig } from 'astro/config';
import rehypeArticle from './src/plugins/rehype-article.mjs';

// GitHub Actions(configure-pages)가 주입하는 값 우선, 로컬은 기본값 사용
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    // 기존 빌더와 같은 평문 코드 블록 (하이라이트 없음) + 앵커/복사 버튼은 rehype 플러그인이 붙인다.
    syntaxHighlight: false,
    // 기존 빌더는 따옴표/대시를 변환하지 않았다.
    smartypants: false,
    rehypePlugins: [[rehypeArticle, { base }]],
  },
});
