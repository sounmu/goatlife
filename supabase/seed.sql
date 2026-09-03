insert into public.challenges (
  id, title, description, deposit_amount, start_date, end_date, max_failures,
  failure_rule, proof_start_time, proof_end_time, status
)
values (
  '11111111-1111-4111-8111-111111111111',
  '14일 미라클 모닝',
  '매일 아침 5시부터 8시 사이, 새로운 하루를 사진으로 인증해요.',
  10000,
  '2026-09-7',
  '2026-09-20',
  3,
  'AT_OR_ABOVE',
  '05:00',
  '08:00',
  'OPEN'
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  deposit_amount = excluded.deposit_amount,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  max_failures = excluded.max_failures,
  failure_rule = excluded.failure_rule,
  proof_start_time = excluded.proof_start_time,
  proof_end_time = excluded.proof_end_time,
  status = excluded.status;
