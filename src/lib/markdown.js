import { Marked } from 'marked';
import { escapeHtml } from './html.js';
import { slugify } from './format.js';
import { url } from './url.js';

const isExternal = (href) => /^https?:\/\//i.test(href);

// 마크다운 렌더러 팩토리: 글마다 heading id 중복 카운터를 새로 만든다.
const createRenderer = () => {
  const seenIds = new Map();
  const uniqueId = (text) => {
    const base = slugify(text) || 'section';
    const count = seenIds.get(base) ?? 0;
    seenIds.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };

  return {
    heading({ tokens, depth, text }) {
      const id = uniqueId(text);
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${depth}>\n`;
    },
    code({ text, lang }) {
      const language = (lang ?? '').split(/\s+/)[0];
      const label = language ? `<span class="code-lang">${escapeHtml(language)}</span>` : '';
      return `<div class="code-block">${label}<button class="copy-btn" type="button" aria-label="코드 복사">Copy</button><pre><code class="language-${escapeHtml(language || 'text')}">${escapeHtml(text)}</code></pre></div>\n`;
    },
    link({ href, title, tokens }) {
      const inner = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      const target = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(url(href))}"${titleAttr}${target}>${inner}</a>`;
    },
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(url(href))}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy">`;
    },
  };
};

export const renderMarkdown = (source) =>
  new Marked({ gfm: true }).use({ renderer: createRenderer() }).parse(source);
