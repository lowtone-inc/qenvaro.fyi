import path from 'node:path';
import { readMarkdownFiles } from './fs.js';
import { parseFrontmatter } from './frontmatter.js';
import { renderMarkdown } from './markdown.js';
import { readingMinutes } from './format.js';

const DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}-/;

const assert = (condition, message) => {
  if (!condition) throw new Error(`[content] ${message}`);
};

// 공통: 마크다운 파일 → 프론트매터 + 렌더링된 HTML
const parseDocument = ({ name, source }) => {
  const { data, content } = parseFrontmatter(source);
  assert(data.title, `"${name}" 에 title 이 없습니다.`);
  return {
    slug: data.slug ?? path.basename(name, '.md').replace(DATE_PREFIX_RE, ''),
    title: data.title,
    description: data.description ?? '',
    draft: data.draft === true,
    data,
    content,
    html: renderMarkdown(content),
  };
};

const toPost = (file) => {
  const doc = parseDocument(file);
  const date = new Date(doc.data.date ?? Date.now());
  assert(!Number.isNaN(date.getTime()), `"${file.name}" 의 date 형식이 잘못되었습니다.`);
  const { tags } = doc.data;
  return Object.freeze({
    ...doc,
    date,
    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    readingTime: readingMinutes(doc.content),
  });
};

const loadDocuments = async (dir, mapper) =>
  (await readMarkdownFiles(dir)).map(mapper).filter((doc) => !doc.draft);

const groupByTag = (posts) =>
  posts.reduce((index, post) => {
    post.tags.forEach((tag) => index.set(tag, [...(index.get(tag) ?? []), post]));
    return index;
  }, new Map());

// 게시글 저장소: 로드한 글에 대한 조회 메서드를 제공한다 (Repository 패턴)
export const createPostRepository = async (dir) => {
  const posts = (await loadDocuments(dir, toPost)).sort((a, b) => b.date - a.date);
  const tagIndex = groupByTag(posts);

  return {
    all: () => posts,
    tags: () =>
      [...tagIndex.entries()]
        .map(([name, list]) => ({ name, count: list.length }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    byTag: (tag) => tagIndex.get(tag) ?? [],
    // 목록이 최신순이므로 newer = index - 1
    neighbors: (slug) => {
      const index = posts.findIndex((post) => post.slug === slug);
      return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null };
    },
  };
};

export const loadPages = (dir) => loadDocuments(dir, (file) => Object.freeze(parseDocument(file)));

export const paginate = (items, perPage) => {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: totalPages }, (_, i) => ({
    page: i + 1,
    totalPages,
    items: items.slice(i * perPage, (i + 1) * perPage),
  }));
};
