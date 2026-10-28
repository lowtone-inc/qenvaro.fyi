---
title: 'Row Level Security 처음 써본 후기'
description: '테이블에 RLS를 켜자마자 쿼리 결과가 텅 비었다. 정책을 쓰는 법과 auth.uid() 성능에서 배운 것.'
pubDate: 2026-10-04
category: Database
tags: [postgres, rls, supabase, 보안]
featured: false
draft: false
---

예전부터 Row Level Security라는 말은 들었는데 직접 써본 적은 없었다. 앱 서버에서 `WHERE user_id = ?`를 붙이면 되는 걸 굳이 DB가 왜 막아주나 싶었다. 그러다 사이드 프로젝트에서 클라이언트가 DB에 직접 붙는 구조를 쓰게 되면서, 처음으로 제대로 써봤다.

## 켰더니 아무것도 안 보인다

메모 테이블을 하나 만들었다.

```sql
CREATE TABLE notes (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid NOT NULL,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

RLS를 켜고 `SELECT * FROM notes;`를 날렸더니 결과가 0행이었다. 데이터는 분명히 들어 있는데도. 한참 뭘 잘못했나 싶었는데, 알고 보니 정상 동작이었다. RLS를 켜면 기본이 전부 거부이고, 허용하는 정책을 직접 만들어야 한다. 에러도 안 나고 그냥 비어 보여서 처음엔 당황스럽다.

참고로 테이블 소유자와 `BYPASSRLS` 권한이 있는 역할은 정책을 건너뛴다. 그래서 내가 관리자 계정으로 확인했을 때는 멀쩡해 보이고, 일반 사용자 역할로 붙었을 때만 비어 보인다. 테스트는 꼭 실제 사용자와 같은 역할로 해야 한다.

## 정책 작성

내 메모만 읽고 쓰게 하는 정책은 이렇다.

```sql
CREATE POLICY "notes_select_own" ON notes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notes_insert_own" ON notes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

`USING`은 기존 행을 볼 수 있는지 판단하고, `WITH CHECK`는 새로 들어오거나 수정되는 행이 조건을 만족하는지 판단한다. 처음에 이 둘을 헷갈려서 INSERT 정책에 `USING`을 쓰려다 문법 오류를 만났다. INSERT에는 `WITH CHECK`만 쓸 수 있다.

UPDATE는 둘 다 필요하다. 내 행만 고칠 수 있어야 하고(`USING`), 고친 결과가 남의 것으로 바뀌면 안 되기 때문이다(`WITH CHECK`). 이 부분을 빼먹으면 `user_id`를 다른 사람 걸로 바꿔치기하는 틈이 생긴다.

## 느려지는 함정

쓰다 보니 행이 많은 테이블에서 쿼리가 눈에 띄게 느려졌다. 찾아보니 정책 안의 `auth.uid()`가 행마다 호출될 수 있어서였다. 이런 식으로 서브쿼리로 감싸면 플래너가 한 번만 계산해서 재사용한다고 한다.

```sql
CREATE POLICY "notes_select_own" ON notes
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));
```

그리고 정책에서 자주 비교하는 컬럼에는 인덱스가 필요하다.

```sql
CREATE INDEX idx_notes_user_id ON notes (user_id);
```

RLS는 쿼리에 조건을 몰래 붙여주는 것과 비슷하다. 그러니 그 조건이 타는 컬럼에 인덱스가 없으면 느릴 수밖에 없다. 당연한 말인데 눈에 안 보여서 놓치기 쉽다.

## 써보고 든 생각

- 기본이 거부라서 오히려 안전하다. 정책을 빼먹으면 데이터가 안 보이지, 새어 나가지는 않는다.
- 애플리케이션 코드마다 `WHERE user_id`를 붙이던 부담이 줄었다. 하나 빼먹어서 남의 데이터가 보이는 사고를 DB가 막아준다.
- 대신 디버깅이 어렵다. 결과가 비었을 때 데이터가 없는 건지 정책이 막은 건지 구분이 안 된다. 정책을 바꿀 때마다 역할을 바꿔가며 직접 확인하는 습관이 필요하다.

아직 정책이 복잡한 조인이 들어가는 경우는 못 써봤다. 팀 단위 권한 같은 걸 붙이면 이야기가 달라질 것 같아서, 그때 다시 정리해볼 생각이다.
