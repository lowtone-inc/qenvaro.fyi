---
title: API 응답 캐싱, 남의 데이터가 캐시에 섞인 날
description: 응답을 캐싱하다가 사용자별 데이터가 섞일 뻔했다. Cache-Control, ETag, Vary를 다시 정리했다.
date: 2026-10-12
tags: [api, cache, http, 백엔드]
---

목록 API가 느리다는 얘기가 나와서 응답을 캐싱하기로 했다. 쿼리를 건드리기엔 시간이 없었고, 데이터가 몇 분 늦게 갱신돼도 괜찮은 화면이었다. 헤더 한 줄이면 끝날 줄 알았는데, 하마터면 다른 사용자의 데이터를 보여줄 뻔했다.

## 처음 시도

가장 단순하게 응답 헤더를 붙였다.

```js
app.get('/api/projects', async (req, res) => {
  const projects = await listProjects(req.user.id);
  res.set('Cache-Control', 'public, max-age=300');
  res.json(projects);
});
```

로컬에서는 잘 됐다. 두 번째 요청부터 브라우저가 서버에 오지도 않고 캐시에서 바로 응답을 가져왔다.

문제는 `public`이었다. 이 값은 브라우저뿐 아니라 CDN이나 프록시 같은 중간 캐시도 응답을 저장해도 된다는 뜻이다. 그런데 이 API는 `req.user.id`로 사용자마다 다른 결과를 돌려준다. 중간 캐시가 URL만 보고 키를 만들면, 먼저 요청한 사람의 목록이 다음 사람에게 나갈 수 있다.

리뷰 중에 동료가 그 줄을 짚어줬고, 스테이징에서 계정 두 개로 번갈아 호출해보고 나서야 심각하다는 게 실감 났다.

## 고친 방법

사용자별 응답이면 `private`을 쓴다. 브라우저 캐시만 허용하고 공유 캐시에는 저장하지 못하게 한다.

```js
res.set('Cache-Control', 'private, max-age=60');
```

그리고 같은 URL이라도 요청 헤더에 따라 응답이 달라지면 `Vary`로 알려야 한다.

```js
res.set('Vary', 'Authorization, Accept-Language');
```

`Vary`가 없으면 캐시는 "URL이 같으면 같은 응답"이라고 가정한다. 인증 헤더나 언어에 따라 바뀌는 응답에는 반드시 있어야 한다.

## ETag로 가볍게

시간 기반 캐시는 유효 기간 동안 최신 데이터를 못 본다는 게 아쉬웠다. 그래서 조건부 요청도 붙였다. 응답 본문의 해시를 `ETag`로 내려주고, 클라이언트가 `If-None-Match`로 다시 물어오면 같을 때 304만 돌려준다.

```js
import { createHash } from 'node:crypto';

app.get('/api/projects', async (req, res) => {
  const body = JSON.stringify(await listProjects(req.user.id));
  const etag = `"${createHash('sha1').update(body).digest('hex')}"`;

  res.set('ETag', etag);
  res.set('Cache-Control', 'private, no-cache');

  if (req.get('If-None-Match') === etag) {
    return res.status(304).end();
  }
  res.type('json').send(body);
});
```

`no-cache`는 이름과 달리 캐시를 안 쓴다는 뜻이 아니다. 저장은 하되 쓰기 전에 매번 서버에 확인하라는 뜻이다. 쿼리는 여전히 실행되니 DB 부하는 안 줄지만, 응답 전송량은 확실히 줄어든다. 사실 Express는 `res.json`에 기본으로 약한 ETag를 붙여주니, 직접 구현하기 전에 이미 되고 있는 건 아닌지 먼저 확인하는 게 맞다.

## 정리

- 사용자별 응답에는 `public`을 쓰지 않는다. `private`이 기본이다.
- 요청 헤더에 따라 달라지는 응답은 `Vary`로 명시한다.
- 갱신이 중요하면 `max-age`보다 ETag와 `no-cache` 조합이 낫다.
- 캐시를 붙인 뒤에는 계정 두 개로 번갈아 호출해서 눈으로 확인한다.

캐시 버그는 로컬에서 거의 재현되지 않는다. 계정이 하나뿐이니까. 이걸 알고 나서부터 캐시 관련 변경은 테스트 계정 두 개를 꼭 만들어놓고 시작한다.
