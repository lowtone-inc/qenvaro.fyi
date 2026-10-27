// 사이트 전역 설정. 배포 환경에 따라 달라지는 값은 환경변수로 덮어쓴다.
const normalizeBasePath = (value = '') => {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
};

export const config = Object.freeze({
  title: 'qenvaro.fyi',
  tagline: 'Build in a weekend. Write for a lifetime.',
  description: 'Supabase 감성으로 만든 개발 블로그 — 기록하고, 배우고, 공유합니다.',
  author: 'Lowtone',
  hero: {
    eyebrow: 'Now writing',
    title: 'Build in a weekend.',
    highlight: 'Write for a lifetime.',
  },
  lang: 'ko',
  siteUrl: (process.env.SITE_URL ?? '').replace(/\/+$/, ''),
  basePath: normalizeBasePath(process.env.BASE_PATH),
  postsPerPage: 6,
  nav: [
    { label: 'Blog', href: '/' },
    { label: 'Tags', href: '/tags/' },
    { label: 'About', href: '/about/' },
  ],
  social: [
    { label: 'GitHub', href: 'https://github.com/lowtone-inc/qenvaro.fyi' },
    { label: 'RSS', href: '/feed.xml' },
  ],
  paths: {
    posts: 'content/posts',
    pages: 'content/pages',
    public: 'public',
    out: 'dist',
  },
});
