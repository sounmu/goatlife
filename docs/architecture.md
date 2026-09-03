# MVP 구조와 데이터 설계

## 요청 흐름

브라우저는 Next.js 화면과 Server Action만 호출합니다. 모든 데이터 접근은 서버의 Supabase service-role 클라이언트를 통하며, 페이지와 Action에서 참가자 세션 또는 관리자 세션을 다시 검증합니다. 인증 이미지는 private Storage bucket에 저장하고 `/api/proofs/[id]/image`가 동일 챌린지 참가자 또는 관리자에게만 전달합니다.

## 테이블 책임

| 테이블 | 책임 |
| --- | --- |
| `challenges` | 기간, 보증금, 인증 시간, 실패 기준과 운영 상태 |
| `participants` | 닉네임, 전화번호, 입금자명, 복구코드 해시 |
| `challenge_participants` | 챌린지별 결제·참가·환급 상태 |
| `participant_tokens` | 개인 참가 링크 토큰 해시와 만료·사용 시각 |
| `participant_sessions` | 장기 로그인 세션 토큰 해시와 만료·폐기 시각 |
| `proofs` | 날짜별 인증 이미지 경로, 글, 유효 상태 |

`proofs(participant_id, challenge_id, proof_date)`에는 UNIQUE 제약을 두어 서버 검증과 별개로 하루 한 번만 저장되게 합니다.

## 상태 전이

1. 신청: `WAITING / APPLIED`
2. 운영자 입금 확인: `PAID / ACTIVE`
3. 실패 기준 충족: `FAILED`
4. 종료일까지 성공: `SUCCESS`
5. 보증금 반환 완료: `REFUNDED`

실패 횟수는 종료된 인증 가능 날짜 수에서 유효 인증 날짜 수를 빼서 계산합니다. 당일 인증 시간이 끝나기 전에는 해당 날짜를 실패로 세지 않습니다. `failure_rule`은 `AT_OR_ABOVE`와 `ABOVE`를 지원합니다.

## 운영 범위

단일 Next.js 앱 안에 화면, Server Action, 데이터 접근을 두었습니다. 별도 API 서버, ORM 계층, 메시지 큐, 자동 입금 확인은 의도적으로 제외했습니다. 상태 판정은 관리자 화면에서 수동 갱신해 3주 운영 중 규칙 변경이나 인증 무효 처리를 즉시 반영할 수 있습니다.
