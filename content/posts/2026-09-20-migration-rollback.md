---
title: 롤백하다가 데이터를 날릴 뻔했다
description: 컬럼 이름을 바꾸는 마이그레이션을 배포했다가 롤백했는데, down 스크립트가 데이터를 지우고 있었다.
date: 2026-09-20
tags: [postgres, migration, 장애]
---

배포 후 10분 만에 롤백을 결정했다. 그리고 그 롤백이 더 큰 사고가 될 뻔했다. 크게 터지기 전에 잡았지만, 식은땀이 났던 이야기라 기록해둔다.

## 상황

사용자 테이블에 `nickname` 컬럼이 있었는데, 이름을 `display_name`으로 바꾸고 싶었다. 마이그레이션 도구는 up과 down을 둘 다 작성하게 돼 있다. 나는 이렇게 썼다.

```sql
-- up
ALTER TABLE users ADD COLUMN display_name text;
UPDATE users SET display_name = nickname;
ALTER TABLE users DROP COLUMN nickname;

-- down
ALTER TABLE users ADD COLUMN nickname text;
ALTER TABLE users DROP COLUMN display_name;
```

up은 컬럼을 추가하고 값을 복사한 다음 옛 컬럼을 지운다. down은 반대로 되돌린다. 그런데 down에는 복사 단계가 없다. `nickname`을 다시 만들기만 하고, 값은 채우지 않은 채 `display_name`을 지워버린다.

## 무슨 일이 있었나

배포하자마자 앱 쪽에서 `nickname`을 읽는 코드가 하나 남아 있다는 게 드러났다. 에러가 올라오기 시작했고, 나는 곧바로 롤백을 결정했다. 그리고 down을 실행하려는 순간, 손이 멈췄다. 스크립트를 한 줄씩 읽다가 알아챈 것이다. 이대로 돌리면 모든 사용자의 닉네임이 `NULL`이 된다.

게다가 그 사이에 새로 가입한 사용자의 `display_name`은 영영 복구할 수 없게 된다. 옛 컬럼에는 값이 없으니까.

## 어떻게 수습했나

down을 실행하지 않고 수동으로 순서를 바꿨다.

```sql
BEGIN;
ALTER TABLE users ADD COLUMN nickname text;
UPDATE users SET nickname = display_name;
COMMIT;
```

값을 먼저 복사해서 앱이 옛 컬럼을 다시 읽을 수 있게 했고, `display_name`은 지우지 않고 그대로 뒀다. 트랜잭션으로 묶은 건 중간 상태가 남지 않게 하려는 거였다. Postgres는 DDL도 트랜잭션 안에서 롤백되니까 이럴 때 편하다.

## 그 뒤로 바꾼 습관

**1. 컬럼 이름 변경은 한 번에 하지 않는다.** 이제는 단계를 쪼갠다.

1. 새 컬럼을 추가하고, 앱이 양쪽에 다 쓰게 한다.
2. 기존 데이터를 백필한다.
3. 앱이 새 컬럼만 읽게 배포한다.
4. 충분히 지켜본 뒤 옛 컬럼을 지우는 마이그레이션을 따로 낸다.

이렇게 하면 어느 단계에서든 되돌릴 수 있다. 되돌릴 수 없는 작업은 컬럼 삭제 하나뿐이고, 그건 맨 마지막으로 미룬다.

**2. down은 쓰자마자 실제로 돌려본다.** 로컬 DB에 데이터를 몇 줄 넣고 up, down, up을 차례로 실행해본다. down을 한 번도 안 돌려본 채로 배포하는 건 소화기를 한 번도 확인 안 하고 불 옆에서 요리하는 것과 같다.

**3. 데이터를 지우는 구문은 리뷰에서 따로 묻는다.** `DROP COLUMN`, `DROP TABLE`, `TRUNCATE`가 보이면 "복구 방법이 뭐예요?"라고 묻기로 했다.

롤백은 평소에 안 쓰다가 급할 때만 쓰게 된다. 그래서 가장 덜 검증된 코드가 가장 긴장되는 순간에 실행된다. 이 아이러니를 기억해두려고 한다.
