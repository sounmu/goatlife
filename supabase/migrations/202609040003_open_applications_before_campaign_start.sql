begin;

update public.challenges
set
  application_start_date = date '2026-09-04',
  application_end_date = date '2026-09-13',
  duration_days = 14,
  start_date = date '2026-09-06',
  end_date = date '2026-09-27'
where id = '11111111-1111-4111-8111-111111111111';

update public.challenge_participants cp
set
  start_date = greatest(
    (cp.joined_at at time zone 'Asia/Seoul')::date + 1,
    date '2026-09-06'
  ),
  end_date = greatest(
    (cp.joined_at at time zone 'Asia/Seoul')::date + 1,
    date '2026-09-06'
  ) + 13
where cp.challenge_id = '11111111-1111-4111-8111-111111111111';

create or replace function public.apply_to_challenge(
  p_challenge_id uuid,
  p_nickname text,
  p_phone text,
  p_depositor_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant_id uuid;
  v_challenge_status text;
  v_application_start date;
  v_application_end date;
  v_duration_days integer;
  v_challenge_start date;
  v_application_date date := (now() at time zone 'Asia/Seoul')::date;
  v_start_date date;
begin
  select status, application_start_date, application_end_date, duration_days, start_date
    into v_challenge_status, v_application_start, v_application_end, v_duration_days, v_challenge_start
    from public.challenges
    where id = p_challenge_id
    for share;

  if v_challenge_status is distinct from 'OPEN' then
    raise exception 'challenge_not_open';
  end if;
  if v_application_date < v_application_start or v_application_date > v_application_end then
    raise exception 'application_closed';
  end if;

  select id into v_participant_id from public.participants where phone = p_phone;
  if v_participant_id is null then
    insert into public.participants (nickname, phone, depositor_name)
    values (p_nickname, p_phone, p_depositor_name)
    returning id into v_participant_id;
  else
    if exists (
      select 1 from public.challenge_participants
      where challenge_id = p_challenge_id and participant_id = v_participant_id
    ) then
      raise exception 'already_applied';
    end if;
    update public.participants
      set nickname = p_nickname, depositor_name = p_depositor_name
      where id = v_participant_id;
  end if;

  v_start_date := greatest(v_application_date + 1, v_challenge_start);
  insert into public.challenge_participants (
    challenge_id,
    participant_id,
    start_date,
    end_date
  ) values (
    p_challenge_id,
    v_participant_id,
    v_start_date,
    v_start_date + (v_duration_days - 1)
  );
  return v_participant_id;
end;
$$;

revoke all on function public.apply_to_challenge(uuid, text, text, text) from public;
grant execute on function public.apply_to_challenge(uuid, text, text, text) to service_role;

insert into public.daily_random_missions (challenge_id, mission_date, title, description)
values (
  '11111111-1111-4111-8111-111111111111',
  date '2026-09-06',
  '오늘의 다짐 한 줄',
  '이번 14일 동안 이루고 싶은 변화를 한 줄로 적어보세요.'
)
on conflict (challenge_id, mission_date) do update set
  title = excluded.title,
  description = excluded.description;

commit;
