---
name: deploy
description: 현재 작업을 main 에 push 해 GitHub Pages(qenvaro.fyi)에 배포한다. "배포해줘", "main 에 올려줘", "사이트에 반영해줘", /deploy 요청에 사용.
---

# /deploy — main push 로 GitHub Pages 배포

`main` 에 push 되면 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포한다.
브랜치·PR 없이 `main` 에 바로 push 하는 방식이다. 사용자가 `/deploy` 를 부르거나 배포를 요청한 것 자체가 push 승인이다. 단, 아래 "멈추는 경우"에 해당하면 push 하지 않고 보고한다.

## 1. 로컬 검증

```bash
git status --short
npm ci
npm run build      # astro check + build. 실패하면 고치고 다시 — 통과 전에는 다음 단계로 가지 않는다.
```

- 이번 변경에 새 글이 있다면 frontmatter 의 `draft` 값을 확인한다. `draft: true` 면 배포해도 사이트에 안 보이므로, 공개할 의도인지 사용자에게 묻는다.
- `dist/`, `.astro/`, `.env` 가 스테이징되지 않았는지 확인한다.

## 2. 커밋 & 푸시

- `main` 브랜치에서 작업한다. 최신화: `git pull --rebase origin main`
- 커밋 메시지: `feat:` / `fix:` / `docs:` / `chore:` + 한국어 요약.
- `git push origin main`

## 3. 배포 확인

- `main` 의 `Deploy to GitHub Pages` 워크플로가 `build` → `deploy` 모두 성공했는지 확인한다 (`gh run watch`).
- 실패하면 로그를 읽고 원인을 보고한다. `deploy` 단계에서 Pages 권한 오류가 나면 **Settings → Pages → Source = GitHub Actions** 설정을 안내한다.
- 성공하면 https://qenvaro.fyi/ 와 바뀐 페이지 URL 을 알려준다.

## 멈추는 경우 (push 하지 않고 사용자에게 보고)

- 로컬 빌드가 고쳐지지 않을 때
- pull --rebase 충돌 해결에서 양쪽 로직 중 하나를 버려야 할 때
- 변경 범위가 사용자가 요청한 것보다 넓어 보일 때
- `public/CNAME`, `.github/workflows/`, `src/config.ts` 의 인증 코드가 바뀌었는데 요청에 없던 변경일 때

## 결과 보고 형식

- push 한 커밋
- 배포 워크플로 결과 (성공/실패)
- 확인할 URL
