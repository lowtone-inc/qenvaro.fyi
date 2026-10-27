---
title: Hello, qenvaro.fyi 👋
description: Supabase 감성의 다크 테마와 GitHub Actions 자동 배포로 블로그를 시작합니다.
date: 2026-10-27
tags: [blog, intro]
---

새 블로그를 열었습니다. 마크다운 파일 하나를 `content/posts/` 에 추가하고 `main` 브랜치에 푸시하면 **GitHub Actions** 가 빌드해서 **GitHub Pages** 로 배포합니다.

## 이 블로그가 동작하는 방식

1. `content/posts/*.md` 에 글을 씁니다.
2. `main` 에 푸시합니다.
3. 워크플로가 `npm run build` 로 `dist/` 를 만들고 Pages 에 업로드합니다.

> 서버도, 데이터베이스도 없습니다. 정적 파일만 있으면 충분합니다.

## 새 글 만들기

```bash
npm run new -- "글 제목"
```

위 명령은 오늘 날짜가 붙은 마크다운 파일을 만들어 줍니다. [태그 목록](/tags/)에서 다른 글도 둘러보세요.
