// 글 본문 후처리: 제목 앵커, 코드 블록(언어 라벨 + 복사 버튼), 링크/이미지 처리.
// 기존 Node 빌더의 marked 커스텀 렌더러와 같은 HTML 을 만든다.

const isExternal = (href) => /^https?:\/\//i.test(href);
const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const classOf = (node) => [node.properties?.className ?? []].flat();

// 내부 절대 경로에 base 를 붙인다.
const withBase = (href, base) => {
  const prefix = base.replace(/\/$/, '');
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') ? `${prefix}${href}` : href;
};

// 제목 id: 기존 빌더의 slugify 규칙. Astro 의 id 부여는 이 플러그인 뒤에 실행되므로 직접 만든다.
const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));
const slugify = (value) =>
  value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-');
const createIdMaker = () => {
  const seen = new Map();
  return (value) => {
    const id = slugify(value) || 'section';
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    return count ? `${id}-${count}` : id;
  };
};

const wrapCodeBlock = (pre) => {
  const code = pre.children.find((c) => c.type === 'element' && c.tagName === 'code');
  const lang = classOf(code ?? pre).find((c) => String(c).startsWith('language-'));
  const language = lang ? String(lang).slice('language-'.length) : '';
  // 코드 끝 개행은 기존 출력과 같게 제거한다.
  const last = code?.children.at(-1);
  if (last?.type === 'text') last.value = last.value.replace(/\n$/, '');
  if (code && !lang) code.properties.className = [...classOf(code), 'language-text'];
  return el('div', { className: ['code-block'] }, [
    ...(language ? [el('span', { className: ['code-lang'] }, [text(language)])] : []),
    el('button', { className: ['copy-btn'], type: 'button', ariaLabel: '코드 복사' }, [text('Copy')]),
    pre,
  ]);
};

const transform = (node, base, makeId) => {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type !== 'element') return child;
    const { tagName, properties } = child;
    if (/^h[1-6]$/.test(tagName)) {
      const id = makeId(textOf(child));
      properties.id = id;
      child.children.unshift(el('a', { className: ['anchor'], href: `#${id}`, ariaHidden: 'true' }, [text('#')]));
    }
    if (tagName === 'a' && properties.href) {
      properties.href = withBase(properties.href, base);
      if (isExternal(properties.href)) Object.assign(properties, { target: '_blank', rel: 'noopener noreferrer' });
    }
    if (tagName === 'img') Object.assign(properties, { src: withBase(properties.src, base), loading: 'lazy' });
    transform(child, base, makeId);
    return tagName === 'pre' ? wrapCodeBlock(child) : child;
  });
};

export default function rehypeArticle({ base = '/' } = {}) {
  return (tree) => transform(tree, base, createIdMaker());
}
