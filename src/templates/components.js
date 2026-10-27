// 재사용 UI 컴포넌트. 각 함수는 props 객체를 받아 SafeHtml 을 반환한다.
import { config } from '../config.js';
import { html } from '../lib/html.js';
import { url, postPath, tagPath, pagePath } from '../lib/url.js';
import { formatDate, isoDate } from '../lib/format.js';

const icons = {
  logo: html`<svg viewBox="0 0 109 113" width="22" height="22" aria-hidden="true"><path d="M63.7 110.3c-2.9 3.6-8.7 1.6-8.8-3l-1-67.3h45.2c8.2 0 12.8 9.5 7.7 15.9z" fill="url(#lg1)"/><path d="M63.7 110.3c-2.9 3.6-8.7 1.6-8.8-3l-1-67.3h45.2c8.2 0 12.8 9.5 7.7 15.9z" fill="url(#lg2)" fill-opacity=".2"/><path d="M45.3 2.1c2.9-3.6 8.7-1.6 8.8 3l.4 67.3H9.8c-8.2 0-12.8-9.5-7.7-15.9z" fill="#3ECF8E"/><defs><linearGradient id="lg1" x1="53.97" y1="54.97" x2="94.16" y2="71.83" gradientUnits="userSpaceOnUse"><stop stop-color="#249361"/><stop offset="1" stop-color="#3ECF8E"/></linearGradient><linearGradient id="lg2" x1="36.16" y1="30.58" x2="54.48" y2="65.08" gradientUnits="userSpaceOnUse"><stop/><stop offset="1" stop-opacity="0"/></linearGradient></defs></svg>`,
  sun: html`<svg class="icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  moon: html`<svg class="icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`,
  arrow: html`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
};

export const Arrow = () => icons.arrow;

// 홈('/') 메뉴는 목록 페이지네이션과 글 상세에서도 활성화한다.
const HOME_SECTIONS = ['/page/', '/posts/'];
const isActive = (href, currentPath) =>
  href === '/'
    ? currentPath === '/' || HOME_SECTIONS.some((prefix) => currentPath.startsWith(prefix))
    : currentPath.startsWith(href);

const NavLink = ({ label, href }, currentPath) => {
  const active = isActive(href, currentPath);
  return html`<a class="nav-link${active ? ' is-active' : ''}" href="${url(href)}">${label}</a>`;
};

export const Header = ({ currentPath }) => html`
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${url('/')}">${icons.logo}<span>${config.title}</span></a>
      <nav class="nav" aria-label="주요 메뉴">${config.nav.map((item) => NavLink(item, currentPath))}</nav>
      <button class="theme-toggle" type="button" aria-label="테마 전환" data-theme-toggle>${icons.sun}${icons.moon}</button>
    </div>
  </header>`;

export const Footer = () => html`
  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© ${new Date().getFullYear()} ${config.author}. Built with Markdown, deployed by GitHub Actions.</p>
      <nav class="footer-links">${config.social.map(({ label, href }) => html`<a href="${url(href)}">${label}</a>`)}</nav>
    </div>
  </footer>`;

export const Badge = (text) => html`<span class="badge"><span class="badge-dot"></span>${text}</span>`;

export const Hero = ({ eyebrow, title, highlight, description }) => html`
  <section class="hero">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="container hero-inner">
      ${eyebrow ? Badge(eyebrow) : ''}
      <h1 class="hero-title">${title}${highlight ? html` <span class="text-brand">${highlight}</span>` : ''}</h1>
      ${description ? html`<p class="hero-desc">${description}</p>` : ''}
    </div>
  </section>`;

export const TagChip = (tag, { count, active = false } = {}) => html`
  <a class="tag${active ? ' is-active' : ''}" href="${url(tagPath(tag))}">#${tag}${count != null ? html`<span class="tag-count">${count}</span>` : ''}</a>`;

export const TagList = (tags) => (tags.length ? html`<div class="tag-list">${tags.map((tag) => TagChip(tag))}</div>` : '');

export const PostMeta = (post) => html`
  <div class="post-meta">
    <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
    <span class="dot">•</span>
    <span>${post.readingTime}분 읽기</span>
  </div>`;

export const PostCard = (post) => html`
  <article class="card">
    <a class="card-link" href="${url(postPath(post.slug))}" aria-label="${post.title}"></a>
    ${PostMeta(post)}
    <h2 class="card-title">${post.title}</h2>
    ${post.description ? html`<p class="card-desc">${post.description}</p>` : ''}
    <div class="card-footer">
      ${TagList(post.tags)}
      <span class="card-more">Read ${Arrow()}</span>
    </div>
  </article>`;

export const PostGrid = (posts) =>
  posts.length ? html`<div class="post-grid">${posts.map(PostCard)}</div>` : html`<p class="empty">아직 글이 없습니다.</p>`;

export const SectionHeader = ({ title, subtitle }) => html`
  <div class="section-header">
    <h2>${title}</h2>
    ${subtitle ? html`<p>${subtitle}</p>` : ''}
  </div>`;

const PageButton = (label, page, disabled) =>
  disabled
    ? html`<span class="btn btn-ghost is-disabled">${label}</span>`
    : html`<a class="btn btn-ghost" href="${url(pagePath(page))}">${label}</a>`;

export const Pagination = ({ page, totalPages }) =>
  totalPages <= 1
    ? ''
    : html`
  <nav class="pagination" aria-label="페이지 이동">
    ${PageButton('← 최신 글', page - 1, page <= 1)}
    <span class="pagination-info">${page} / ${totalPages}</span>
    ${PageButton('이전 글 →', page + 1, page >= totalPages)}
  </nav>`;

const NeighborLink = (post, label, align) =>
  post
    ? html`<a class="neighbor neighbor-${align}" href="${url(postPath(post.slug))}"><span class="neighbor-label">${label}</span><span class="neighbor-title">${post.title}</span></a>`
    : html`<span></span>`;

export const PostNeighbors = ({ newer, older }) =>
  newer || older
    ? html`<nav class="neighbors" aria-label="이웃 글">${NeighborLink(older, '← 이전 글', 'left')}${NeighborLink(newer, '다음 글 →', 'right')}</nav>`
    : '';
