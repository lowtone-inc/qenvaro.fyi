---
name: deploy
description: 현재 작업을 main 에 merge 해 GitHub Pages(qenvaro.fyi)에 배포한다. "배포해줘", "main 에 올려줘", "사이트에 반영해줘", /deploy 요청에 사용.
---

# /deploy — main merge 로 GitHub Pages 배포

`main` 에 merge 되면 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포한다.
이 스킬은 그 앞뒤(검증 → PR → merge → 배포 확인)를 끝까지 처리한다.
사용자가 `/deploy` 를 부르거나 배포를 요청한 것 자체가 merge 승인이다. 단, 아래 "멈추는 경우"에 해당하면 merge 하지 않고 보고한다.

## 1. 로컬 검증

```bash
git status --short
npm ci
npm run build      # astro check + build. 실패하면 고치고 다시 — 통과 전에는 다음 단계로 가지 않는다.
```

- 이번 변경에 새 글이 있다면 frontmatter 의 `draft` 값을 확인한다. `draft: true` 면 배포해도 사이트에 안 보이므로, 공개할 의도인지 사용자에게 묻는다.
- `dist/`, `.astro/`, `.env` 가 스테이징되지 않았는지 확인한다.

## 2. 커밋 & 푸시

- 현재 브랜치가 `main` 이면 작업 브랜치(`feat/<요약>` 등)를 만들어 옮긴다. **`main` 에 직접 push 하지 않는다.**
- 커밋 메시지: `feat:` / `fix:` / `docs:` / `chore:` + 한국어 요약.
- `git push -u origin <branch>`

## 3. PR 생성

- 같은 브랜치의 열린 PR 이 있으면 그것을 쓴다. 없으면 base `main` 으로 PR 을 만든다.
- 제목은 커밋 요약과 같게, 본문에는 바뀐 내용(새 글 제목·URL, 수정한 화면 등)을 짧게 적는다.

## 4. PR 빌드 체크 대기

- PR 에서 `Deploy to GitHub Pages / build` 체크가 돈다 (배포는 안 함).
- 초록이 되면 다음 단계. 빨강이면 로그를 읽고 원인을 고쳐 다시 push 한다. 테스트를 끄거나 건너뛰는 식으로 통과시키지 않는다.
- merge 충돌이 있으면 `main` 을 브랜치에 merge 해서 해결한 뒤 다시 빌드 검증.

## 5. Merge

- 기존 히스토리처럼 **merge commit** 방식으로 merge 한다 ("Merge pull request #N …").

## 6. 배포 확인

- `main` 의 `Deploy to GitHub Pages` 워크플로가 `build` → `deploy` 모두 성공했는지 확인한다.
- 실패하면 로그를 읽고 원인을 보고한다. `deploy` 단계에서 Pages 권한 오류가 나면 **Settings → Pages → Source = GitHub Actions** 설정을 안내한다.
- 성공하면 https://qenvaro.fyi/ 와 바뀐 페이지 URL(예: `/posts/<slug>/`)을 알려준다.

## 멈추는 경우 (merge 하지 않고 사용자에게 보고)

- 로컬 또는 PR 빌드가 고쳐지지 않을 때
- 충돌 해결에서 양쪽 로직 중 하나를 버려야 할 때
- 변경 범위가 사용자가 요청한 것보다 넓어 보일 때 (다른 사람 커밋이 섞인 경우 등)
- `public/CNAME`, `.github/workflows/`, `src/config.ts` 의 인증 코드가 바뀌었는데 요청에 없던 변경일 때

## 결과 보고 형식

- PR 링크, merge 여부
- 배포 워크플로 결과 (성공/실패)
- 확인할 URL
