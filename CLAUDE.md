# CLAUDE.md

Supabase 스타일 정적 블로그 (Astro 5 + TypeScript). `main` = 운영 사이트(https://qenvaro.fyi/).

## 명령

```bash
npm ci                 # 의존성 설치
npm run dev            # http://localhost:4321 (draft 글도 보임)
npm run build          # astro check(타입 체크) + astro build → dist/
npm run new -- "제목"  # src/content/posts/<slug>.md 초안 생성 (draft: true)
```

테스트·린트는 없다. **변경 후에는 항상 `npm run build` 가 통과하는지 확인한다** (CI 와 같은 검증).

## 배포 규칙

- 브랜치는 `main` 하나만 쓴다. 작업 브랜치·PR 없이 **`main` 에 바로 push** 한다.
- `main` 에 push 되면 `.github/workflows/deploy.yml` 이 빌드 후 GitHub Pages 에 **자동 배포**한다. 빌드가 깨진 채 push 하면 배포가 실패하므로 push 전 `npm run build` 확인은 필수.
- 배포 절차 전체는 `/deploy` 스킬(`.claude/skills/deploy/SKILL.md`)을 따른다.
- 커스텀 도메인은 `public/CNAME` — 지우거나 바꾸지 않는다. `public/.nojekyll` 도 유지한다.
- Node 버전은 `.nvmrc`(22) 와 workflow 의 `node-version` 을 같이 맞춘다.

## 구조

```text
src/config.ts          사이트 설정 · 메뉴 · 서치콘솔 인증 코드 (하드코딩 대신 여기서 가져온다)
src/content.config.ts  글 frontmatter 스키마 (zod)
src/content/posts/     글 — 파일명이 곧 URL (/posts/<slug>/)
src/lib/               posts(조회·태그·페이지네이션) · url(base 경로) · format 헬퍼
src/layouts/           Base → Home / Post / Article 레이아웃
src/components/        재사용 UI 컴포넌트
src/pages/             라우트 (index, page/[page], posts, tags, about, feed/sitemap/robots)
src/plugins/           rehype 플러그인 (제목 앵커, 코드 복사 버튼)
public/                그대로 복사되는 정적 파일 (styles.css, main.js, CNAME …)
```

## 코드 규칙

- **재사용 우선**: 새로 만들기 전에 `src/components/`, `src/layouts/`, `src/lib/` 에 있는 것을 먼저 쓴다. 두 번 이상 반복되는 마크업은 컴포넌트로, 로직은 `src/lib/` 함수로 뽑는다.
- **데이터 접근은 `src/lib/posts.ts` 를 거친다** (`getPosts`, `getTagGroups` 등). 페이지에서 `getCollection` 을 직접 부르지 않는다 — draft 필터·정렬이 한곳에 모여 있다.
- **내부 링크는 `src/lib/url.ts`** (`withBase`, `postUrl`, `tagUrl`, `pageUrl`) 로 만든다. `href="/..."` 를 직접 쓰면 `BASE_PATH` 가 있을 때 깨진다.
- 레이아웃 계층(Base → Home/Post/Article)을 유지하고, `<head>` 메타는 `BaseHead.astro` 에서만 다룬다.
- `trailingSlash: 'always'` — 새 경로는 `/` 로 끝나게 만든다.
- 새 의존성은 꼭 필요할 때만 추가한다.
- `dist/`, `.astro/` 는 빌드 결과물이라 수정·커밋하지 않는다.

## 글 작성

frontmatter 는 `src/content.config.ts` 스키마를 따른다: `title`, `description`, `pubDate`, `category`, `tags`, `featured`, `draft` (+ 선택 `updatedDate`).
`draft: true` 인 글은 운영 빌드에서 빠진다 — 공개하려면 `false` 로 바꾼다.

## 커밋

`feat:` / `fix:` / `docs:` / `chore:` 접두사 + 한국어 요약 (기존 히스토리와 동일).
