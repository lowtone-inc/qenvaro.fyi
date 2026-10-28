export const SITE = {
  title: 'qenvaro.fyi',
  tagline: 'Build in a weekend. Write for a lifetime.',
  description: 'Supabase 감성으로 만든 개발 블로그 — 기록하고, 배우고, 공유합니다.',
  author: 'Lowtone',
  locale: 'ko-KR',
  postsPerPage: 6,
  // 글별 이미지가 없을 때 쓰는 공유 이미지 (public/ 기준 경로)
  ogImage: '/og-default.png',
} as const;

// 홈 히어로 문구
export const HERO = {
  eyebrow: 'Now writing',
  title: 'Build in a weekend.',
  highlight: 'Write for a lifetime.',
} as const;

// 서치콘솔 소유 확인 코드. 값이 있을 때만 meta 태그를 출력한다.
export const SITE_VERIFICATION = {
  google: '',
  naver: 'c367e40f94a8296c0c997cb6faff8e653141caf4',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
] as const;

export const SOCIAL_LINKS = [
  { href: 'https://github.com/lowtone-inc/qenvaro.fyi', label: 'GitHub' },
  { href: '/feed.xml', label: 'RSS' },
] as const;
