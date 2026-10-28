const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 외부 링크는 그대로, 내부 경로는 base 경로를 붙여 반환 */
export function withBase(path: string): string {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

// 홈('/') 메뉴는 목록 페이지네이션과 글 상세에서도 활성화한다.
const HOME_SECTIONS = ['/page/', '/posts/'];

/** 현재 경로가 해당 메뉴 영역에 속하는지 판별 */
export function isActive(currentPath: string, href: string): boolean {
  const path = currentPath.startsWith(BASE) ? currentPath.slice(BASE.length) || '/' : currentPath;
  if (href === '/') return path === '/' || HOME_SECTIONS.some((prefix) => path.startsWith(prefix));
  return path.startsWith(href);
}

export const postUrl = (id: string) => withBase(`/posts/${id}/`);
// 태그 경로는 기존 사이트와 같이 원문 그대로 percent-encode 한다.
export const tagPath = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;
export const tagUrl = (tag: string) => withBase(tagPath(tag));
export const pageUrl = (page: number) => withBase(page <= 1 ? '/' : `/page/${page}/`);
