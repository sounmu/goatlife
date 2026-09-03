# GOAT.LIFE

3주 운영을 목표로 만든 보증금 기반 습관 챌린지 MVP입니다. 참가자는 계좌이체 후 개인 링크 또는 전화번호+참가코드로 로그인하고, 정해진 시간에 하루 한 번 사진 인증을 남깁니다.

## 핵심 구조

- Next.js 16 App Router + TypeScript + Tailwind CSS
- Supabase PostgreSQL + private Storage
- Server Actions 중심의 데이터 변경, Route Handler 기반 private 이미지 전달
- 환경변수 기반 단일 관리자 인증
- `Asia/Seoul` 기준 인증 시간과 실패 횟수 계산

서버만 Supabase service-role key를 사용합니다. 브라우저는 Supabase에 직접 접근하지 않으며 RLS에는 공개 정책을 두지 않았습니다.

## 로컬 실행

1. `.env.example`을 `.env.local`로 복사하고 값을 채웁니다.
2. Supabase SQL Editor에서 `supabase/migrations/202609030001_initial_schema.sql`을 실행합니다.
3. `supabase/seed.sql`을 실행해 기본 챌린지를 만듭니다.
4. `npm run dev`로 시작합니다.

```bash
npm install
npm run dev
```

환경변수 없이도 랜딩과 신청 화면의 디자인은 확인할 수 있지만 신청 저장, 로그인, 인증, 관리자는 Supabase 연결 후 동작합니다.

## 주요 경로

| 경로 | 용도 |
| --- | --- |
| `/` | 랜딩 |
| `/apply` | 참가 신청 |
| `/apply/complete` | 계좌이체 안내 |
| `/join/[token]` | 개인 링크 자동 로그인 |
| `/login` | 전화번호 + 참가코드 로그인 |
| `/feed` | 참가자 인증 피드 |
| `/proof/new` | 하루 1회 인증 |
| `/me` | 내 진행 현황 |
| `/admin` | 입금·참가자·인증 관리 |

## 운영 메모

- 입금 확인 시 참가 링크와 6자리 참가코드가 화면에 한 번 표시됩니다. 즉시 참가자에게 전달하세요.
- 인증 이미지는 private bucket에 저장되고 로그인한 동일 챌린지 참가자 또는 관리자에게만 전달됩니다.
- 선택한 인증 이미지는 브라우저에서 1MB 이하 WebP로 자동 압축되며, 서버와 Storage에서도 같은 제한을 적용합니다.
- 관리자 화면의 `상태 판정 갱신` 버튼이 현재 유효 인증을 기준으로 성공/실패 상태를 갱신합니다.
- 실패 규칙은 챌린지의 `failure_rule`을 `AT_OR_ABOVE` 또는 `ABOVE`로 바꿔 조정할 수 있습니다.

## 확인

```bash
npm run test
npm run lint
npm run build
```
