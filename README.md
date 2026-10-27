# qenvaro.fyi

Supabase 스타일(다크 + 에메랄드 그린)의 정적 블로그입니다. 프레임워크 없이 작은 Node.js 정적 사이트 생성기로 빌드하고, GitHub Actions 로 GitHub Pages 에 자동 배포합니다.

## 빠른 시작

```bash
npm install
npm run dev            # http://localhost:4000 (변경 시 자동 재빌드)
npm run build          # dist/ 생성
npm run new -- "제목"  # 새 글 초안 생성 (draft: true)
```

## 글 쓰기

`content/posts/YYYY-MM-DD-slug.md`

```markdown
---
title: 글 제목
description: 카드와 메타 태그에 쓰이는 요약
date: 2026-10-27
tags: [tag1, tag2]
draft: false
---

본문 (GFM 마크다운)
```

고정 페이지는 `content/pages/<slug>.md` → `/<slug>/` 로 생성됩니다.

## 구조

```text
content/            마크다운 원고 (posts, pages)
public/             그대로 복사되는 정적 파일 (assets/styles.css, assets/main.js, favicon)
src/
  config.js         사이트 설정 (제목, 메뉴, 페이지당 글 수 등)
  build.js          빌드 진입점 — 라우트 생성기 레지스트리
  lib/              html(이스케이프 템플릿) · url(basePath) · content(Repository) · markdown · fs · format
  templates/
    layout.js       공통 HTML 레이아웃
    components.js   재사용 UI 컴포넌트 (Header, PostCard, TagChip, Pagination …)
    route.js        라우트 팩토리 (htmlRoute, fileRoute)
    pages/          홈 · 글 · 태그 · 고정 페이지 · 404 라우트 생성기
    feed.js         RSS (/feed.xml)
scripts/            dev 서버, 새 글 생성기
```

새 페이지 타입은 `({ posts, pages }) => Route[]` 형태의 함수를 만들어 `src/build.js` 의 `routeGenerators` 에 추가하면 됩니다.

## 배포 (GitHub Pages)

`.github/workflows/deploy.yml`

- `main` 푸시 → 빌드 후 Pages 배포
- PR → 빌드만 검증
- 수동 실행(`workflow_dispatch`) 지원

`actions/configure-pages` 의 `base_path` 를 `BASE_PATH` 로 넘기므로 `https://<owner>.github.io/<repo>/` 와 커스텀 도메인 모두 그대로 동작합니다.

### 최초 1회 설정

1. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 선택
2. (선택) 커스텀 도메인: 같은 화면의 **Custom domain** 에 `qenvaro.fyi` 입력 후 DNS 에 `A`/`CNAME` 레코드 추가, **Enforce HTTPS** 체크
