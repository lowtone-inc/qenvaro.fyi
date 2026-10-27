---
title: 인덱스가 있는데도 느렸던 쿼리 회고
description: created_at에 인덱스를 걸어놨는데 일별 집계 쿼리가 풀 스캔을 탔다. 원인은 컬럼에 함수를 씌운 조건절이었다.
date: 2026-09-06
tags: [postgres, index, 성능]
---

월요일 아침에 대시보드가 안 열린다는 말을 들었다. 주문 건수를 일별로 보여주는 화면이었는데, 로딩이 십몇 초씩 걸렸다. 이상한 건 `created_at`에 인덱스가 이미 있었다는 점이다. 인덱스가 있는데 느리다니, 처음엔 통계가 오래됐나 싶어서 `ANALYZE`부터 돌렸다. 달라지는 게 없었다.

## 문제의 쿼리

대시보드가 날리던 쿼리는 이랬다.

```sql
SELECT count(*)
FROM orders
WHERE date_trunc('day', created_at) = '2026-09-01';
```

테이블은 `orders`, 인덱스는 `CREATE INDEX idx_orders_created_at ON orders (created_at);` 하나였다. 읽는 사람 눈에는 멀쩡해 보이는 쿼리다. 나도 처음에는 그랬다.

## EXPLAIN으로 확인

감으로 고치지 말고 실행 계획부터 보자고 마음먹었다.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*)
FROM orders
WHERE date_trunc('day', created_at) = '2026-09-01';
```

결과에는 `Seq Scan on orders`가 찍혀 있었고, `Rows Removed by Filter`가 어마어마했다. 인덱스를 아예 쓰지 않고 테이블 전체를 읽으면서 행마다 `date_trunc`를 계산하고 있었다.

이유는 단순했다. 인덱스에는 `created_at` 원래 값이 정렬돼 저장돼 있다. 그런데 조건절은 `date_trunc('day', created_at)`의 결과를 비교한다. 플래너 입장에서는 인덱스의 정렬 순서와 이 조건이 연결되지 않는다. 컬럼에 함수를 씌우는 순간 일반 B-tree 인덱스는 쓸 수 없게 된다.

## 범위 조건으로 바꾸기

해결은 컬럼을 건드리지 않고 값 쪽을 바꾸는 거였다.

```sql
SELECT count(*)
FROM orders
WHERE created_at >= '2026-09-01'
  AND created_at <  '2026-09-02';
```

반으로 나눠서 `>=`와 `<`를 쓰는 게 포인트다. `BETWEEN`은 양쪽 끝을 포함해서 자정 정각 데이터가 다음 날 것과 겹칠 수 있다. 바꾸고 나니 계획이 `Index Only Scan`으로 바뀌었고, 체감상 로딩이 거의 즉시 끝났다. 정확한 수치를 기록해두지 못한 게 아쉽다. 다음부터는 고치기 전에 숫자를 먼저 적어두기로 했다.

## 함수를 꼭 써야 한다면

쿼리를 못 바꾸는 상황도 있다. ORM이 만들어내는 쿼리라든가. 그럴 땐 표현식 인덱스가 방법이다.

```sql
CREATE INDEX idx_orders_created_day
  ON orders (date_trunc('day', created_at));
```

주의할 점이 하나 있다. `timestamptz` 컬럼에 `date_trunc`를 쓰면 세션 시간대에 따라 결과가 달라지는 STABLE 함수라서, 인덱스 표현식으로 바로 못 쓴다는 오류가 난다. `timestamp`로 바꾸거나 `AT TIME ZONE 'Asia/Seoul'`로 시간대를 고정해서 써야 한다. 나는 결국 범위 조건 쪽을 택했다. 인덱스를 하나 더 늘리는 것보다 쿼리를 고치는 게 싸다.

## 배운 것

- 인덱스가 있다고 쓰이는 게 아니다. `EXPLAIN`으로 실제로 타는지 봐야 한다.
- 인덱스 컬럼에 함수나 연산을 씌우면 인덱스를 못 쓰는 경우가 많다. 값 쪽으로 옮기자.
- 날짜 범위는 `>=`와 `<` 조합이 안전하다.
- 고치기 전후의 숫자를 꼭 남겨두자.

이런 건 한 번 겪어야 몸에 남는다. 이제 `WHERE` 절에 함수가 보이면 일단 의심부터 한다.
