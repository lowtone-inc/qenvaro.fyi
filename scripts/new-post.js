import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from '../src/config.js';
import { writeFileSafe } from '../src/lib/fs.js';
import { slugify, isoDate } from '../src/lib/format.js';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('사용법: npm run new -- "글 제목"');
  process.exit(1);
}

const date = isoDate(new Date());
const file = path.join(config.paths.posts, `${date}-${slugify(title) || 'untitled'}.md`);

if (existsSync(file)) {
  console.error(`이미 존재합니다: ${file}`);
  process.exit(1);
}

await writeFileSafe(
  file,
  `---
title: ${title}
description:
date: ${date}
tags: []
draft: true
---

여기에 내용을 작성하세요.
`,
);
console.log(`✓ ${file} (draft: true — 공개하려면 지우세요)`);
