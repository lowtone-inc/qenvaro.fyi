import { config } from '../config.js';

const isExternal = (href) => /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith('mailto:');

// 사이트 내부 경로에 basePath(예: /repo-name)를 붙인다.
export const url = (path = '/') => {
  if (isExternal(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.basePath}${normalized}`;
};

// RSS·OG 태그용 절대 URL
export const absoluteUrl = (path = '/') => `${config.siteUrl}${url(path)}`;

export const postPath = (slug) => `/posts/${slug}/`;
export const tagPath = (tag) => `/tags/${encodeURIComponent(tag)}/`;
export const pagePath = (page) => (page <= 1 ? '/' : `/page/${page}/`);
