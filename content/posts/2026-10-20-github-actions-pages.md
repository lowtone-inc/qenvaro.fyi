---
title: GitHub Actions 로 GitHub Pages 자동 배포하기
description: configure-pages, upload-pages-artifact, deploy-pages 세 가지 액션으로 끝내는 정적 사이트 배포 파이프라인.
date: 2026-10-20
tags: [github-actions, devops]
---

GitHub Pages 는 이제 브랜치(`gh-pages`) 대신 **Actions 아티팩트**로 배포할 수 있습니다. 빌드 결과물을 저장소에 커밋할 필요가 없어서 히스토리가 깔끔해집니다.

## 파이프라인 구성

| 단계 | 액션 | 하는 일 |
| --- | --- | --- |
| 설정 | `actions/configure-pages` | Pages 메타데이터(base path 등) 조회 |
| 업로드 | `actions/upload-pages-artifact` | `dist/` 를 아티팩트로 업로드 |
| 배포 | `actions/deploy-pages` | 아티팩트를 Pages 에 게시 |

## base path 처리

프로젝트 저장소의 Pages 주소는 `https://<owner>.github.io/<repo>/` 형태라서 모든 링크 앞에 `/<repo>` 가 붙어야 합니다. `configure-pages` 의 `base_path` 출력을 빌드 환경변수로 넘기면 커스텀 도메인이든 아니든 같은 코드로 동작합니다.

```yaml
- id: pages
  uses: actions/configure-pages@v5
- run: npm run build
  env:
    BASE_PATH: ${{ steps.pages.outputs.base_path }}
    SITE_URL: ${{ steps.pages.outputs.origin }}
```

## 권한

배포 잡에는 `pages: write` 와 `id-token: write` 권한이 필요합니다. 나머지는 `contents: read` 면 충분합니다.
