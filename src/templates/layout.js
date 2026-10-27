import { config } from '../config.js';
import { html, raw } from '../lib/html.js';
import { url, absoluteUrl } from '../lib/url.js';
import { Header, Footer } from './components.js';

// 페인트 전에 테마를 적용해 깜빡임을 막는다.
const themeBootScript = `(()=>{try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

const pageTitle = (title) => (title ? `${title} · ${config.title}` : `${config.title} — ${config.tagline}`);

export const Layout = ({ title, description = config.description, path, type = 'website', main }) => html`<!doctype html>
<html lang="${config.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${pageTitle(title)}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#1c1c1c">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${title ?? config.title}">
  <meta property="og:description" content="${description}">
  ${config.siteUrl ? html`<meta property="og:url" content="${absoluteUrl(path)}"><link rel="canonical" href="${absoluteUrl(path)}">` : ''}
  <link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${config.title}" href="${url('/feed.xml')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="${url('/assets/styles.css')}">
  <script>${raw(themeBootScript)}</script>
</head>
<body>
  ${Header({ currentPath: path })}
  <main id="main">${main}</main>
  ${Footer()}
  <script src="${url('/assets/main.js')}" defer></script>
</body>
</html>
`;
