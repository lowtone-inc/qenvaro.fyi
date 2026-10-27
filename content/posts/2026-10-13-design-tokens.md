---
title: CSS 변수로 만드는 Supabase 스타일 디자인 토큰
description: 브랜드 그린, 다크 서피스, 얇은 보더 — 토큰 몇 개로 일관된 다크/라이트 테마를 구성하는 방법.
date: 2026-10-13
tags: [css, design]
---

Supabase 의 인상은 몇 가지 요소에서 나옵니다. **에메랄드 그린 브랜드 컬러**, 거의 검은 배경 위의 **한 단계 밝은 서피스**, 그리고 **1px 보더**입니다.

## 토큰 정의

```css
:root {
  --brand: #3ecf8e;
  --bg: #121212;
  --surface: #1c1c1c;
  --border: #2e2e2e;
  --text: #ededed;
}

:root[data-theme='light'] {
  --bg: #fcfcfc;
  --surface: #ffffff;
  --border: #e6e6e6;
  --text: #1c1c1c;
}
```

컴포넌트는 색상 값을 직접 쓰지 않고 **토큰만 참조**합니다. 그래서 테마 전환은 `data-theme` 속성 하나만 바꾸면 끝납니다.

## 포인트

- 강조는 아껴 쓰기: 브랜드 컬러는 링크, 배지, hover 보더에만
- 그리드 배경 + radial glow 로 히어로에 깊이감 주기
- 메타 정보(날짜, 태그)는 모노스페이스 폰트로 구분하기
