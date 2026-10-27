---
title: About
description: 이 블로그와 만든 사람에 대하여.
---

**qenvaro.fyi** 는 [Lowtone](https://github.com/lowtone-inc) 의 개발 기록 블로그입니다.

## 스택

- 프레임워크 없는 Node.js 정적 사이트 생성기 (`src/`)
- 마크다운 렌더링: [marked](https://marked.js.org)
- 배포: GitHub Actions → GitHub Pages

## 구조

```text
content/
  posts/   블로그 글 (YYYY-MM-DD-slug.md)
  pages/   고정 페이지 (about.md → /about/)
public/    정적 파일 (CSS, JS, favicon)
src/
  lib/        파싱·렌더링·유틸
  templates/  레이아웃, 컴포넌트, 페이지 라우트
```
