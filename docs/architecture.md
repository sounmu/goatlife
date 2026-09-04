# MVP 구조와 데이터 설계

## 요청 흐름

브라우저는 Next.js 화면과 Server Action만 호출합니다. 모든 데이터 접근은 서버의 Supabase service-role 클라이언트를 통하며, 페이지와 Action에서 참가자 세션 또는 관리자 세션을 다시 검증합니다. 인증 이미지는 private Storage bucket에 저장하고 `/api/proofs/[id]/image`가 동일 챌린지 참가자 또는 관리자에게만 전달합니다.

## 테이블 책임

| 테이블 | 책임 |
| --- | --- |
| `challenges` | 신청 기간, 진행 일수, 보증금, 인증 시간, 실패 기준과 운영 상태 |
| `participants` | 닉네임, 전화번호, 입금자명, 복구코드 해시 |
| `challenge_participants` | 챌린지별 결제·참가·환급 상태와 개인 시작·종료일 |
| `daily_random_missions` | 챌린지의 날짜별 랜덤 미션 제목과 설명 |
| `participant_tokens` | 개인 참가 링크 토큰 해시와 만료·사용 시각 |
| `participant_sessions` | 장기 로그인 세션 토큰 해시와 만료·폐기 시각 |
| `proofs` | 날짜별 아침/랜덤 인증, 촬영 출처, 이미지 경로, 글, 유효 상태 |

`proofs(participant_id, challenge_id, proof_date, proof_type)`에는 UNIQUE 제약을 두어 아침과 랜덤 미션을 하루에 각각 한 번만 저장되게 합니다. 미라클 모닝 인증은 `capture_source = CAMERA`만 허용합니다.

## 상태 전이

1. 신청: `WAITING / APPLIED`
2. 운영자 입금 확인: `PAID / ACTIVE`
3. 실패 기준 충족: `FAILED`
4. 종료일까지 성공: `SUCCESS`
5. 보증금 반환 완료: `REFUNDED`

챌린지 `start_date`와 신청 당시 한국 날짜의 다음 날 중 더 늦은 날부터 `duration_days`만큼 개인 진행 기간을 확정합니다. 따라서 9월 6일 전 신청자는 9월 6일에 시작하고, 이후 신청자는 신청 다음 날 시작합니다. 실패 횟수는 개인 진행 기간 중 종료된 아침 인증 가능 날짜 수에서 유효한 아침 인증 날짜 수를 빼서 계산하며, 랜덤 미션은 실패 판정에 포함하지 않습니다. 당일 인증 시간이 끝나기 전에는 해당 날짜를 실패로 세지 않습니다. `failure_rule`은 `AT_OR_ABOVE`와 `ABOVE`를 지원합니다.

## 운영 범위

단일 Next.js 앱 안에 화면, Server Action, 데이터 접근을 두었습니다. 별도 API 서버, ORM 계층, 메시지 큐, 자동 입금 확인은 의도적으로 제외했습니다. 상태 판정은 관리자 화면에서 수동 갱신해 3주 운영 중 규칙 변경이나 인증 무효 처리를 즉시 반영할 수 있습니다.
