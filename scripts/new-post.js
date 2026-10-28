import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// 새 글 초안 생성: src/content/posts/<slug>.md (draft: true)
const POSTS_DIR = 'src/content/posts';

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('사용법: npm run new -- "글 제목"');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const file = path.join(POSTS_DIR, `${slugify(title) || 'untitled'}.md`);

if (existsSync(file)) {
  console.error(`이미 존재합니다: ${file}`);
  process.exit(1);
}

mkdirSync(POSTS_DIR, { recursive: true });
writeFileSync(
  file,
  `---
title: '${title.replace(/'/g, "''")}'
description: ''
pubDate: ${date}
category: Daily
tags: []
featured: false
draft: true
---

여기에 내용을 작성하세요.
`,
);
console.log(`✓ ${file} (draft: true — 공개하려면 false 로 바꾸세요)`);
