# qenvaro.fyi

Supabase 스타일(다크 + 에메랄드 그린) 정적 블로그. Astro 5 기반이며 `main` 에 merge 하면 GitHub Actions 로 GitHub Pages 에 자동 배포됩니다.

## 개발

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # 타입 체크 + 빌드 → dist/
npm run new -- "제목"  # 새 글 초안 생성 (draft: true)
```

## 글 작성

`src/content/posts/<slug>.md` (파일명이 곧 URL: `/posts/<slug>/`)

```md
---
title: '제목'
description: '요약'
pubDate: 2026-10-27
category: Backend
tags: [postgres, 성능]
featured: false
draft: false
---
```

`draft: true` 인 글은 빌드에서 제외됩니다. 고정 페이지는 `src/pages/about.md`.

## 배포

`main` 에 merge (또는 Actions 탭에서 수동 실행) → 빌드 후 Pages 배포. PR 은 빌드만 검증합니다.
최초 1회 저장소 **Settings → Pages → Source** 를 `GitHub Actions` 로 설정하세요. 커스텀 도메인은 `public/CNAME`.

## 구조

```text
public/             정적 파일 (assets/styles.css, assets/main.js, favicon, og-default.png, CNAME)
src/
  config.ts         사이트 설정, 메뉴
  content.config.ts 글 스키마
  content/posts/    글 (markdown)
  plugins/          rehype 플러그인 (제목 앵커, 코드 복사 버튼)
  lib/              posts · url · format 헬퍼
  layouts/          Base / Home / Post / Article 레이아웃
  components/       UI 컴포넌트
  pages/            라우트 (홈, /page/N/, posts, tags, about, 404, feed.xml, sitemap.xml, robots.txt)
scripts/new-post.js 새 글 생성기
```
