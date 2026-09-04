alter table public.challenges
  add column application_start_date date,
  add column application_end_date date,
  add column duration_days integer;

update public.challenges
set
  application_start_date = start_date - 1,
  application_end_date = start_date + 6,
  duration_days = end_date - start_date + 1;

alter table public.challenges
  alter column application_start_date set not null,
  alter column application_end_date set not null,
  alter column duration_days set not null,
  add constraint challenges_application_period_check check (application_end_date >= application_start_date),
  add constraint challenges_duration_days_check check (duration_days > 0);

alter table public.challenge_participants
  add column start_date date,
  add column end_date date;

update public.challenge_participants cp
set
  start_date = (cp.joined_at at time zone 'Asia/Seoul')::date + 1,
  end_date = (cp.joined_at at time zone 'Asia/Seoul')::date + c.duration_days
from public.challenges c
where c.id = cp.challenge_id;

alter table public.challenge_participants
  alter column start_date set not null,
  alter column end_date set not null,
  add constraint challenge_participants_period_check check (end_date >= start_date);

create table public.daily_random_missions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  mission_date date not null,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 240),
  created_at timestamptz not null default now(),
  unique (challenge_id, mission_date)
);

alter table public.proofs
  add column proof_type text not null default 'MORNING'
    check (proof_type in ('MORNING', 'RANDOM')),
  add column capture_source text not null default 'CAMERA'
    check (capture_source in ('CAMERA', 'UPLOAD')),
  add column daily_random_mission_id uuid references public.daily_random_missions(id) on delete restrict;

alter table public.proofs
  drop constraint proofs_participant_id_challenge_id_proof_date_key,
  add constraint proofs_type_mission_check check (
    (proof_type = 'MORNING' and daily_random_mission_id is null and capture_source = 'CAMERA')
    or
    (proof_type = 'RANDOM' and daily_random_mission_id is not null)
  ),
  add constraint proofs_participant_challenge_date_type_key
    unique (participant_id, challenge_id, proof_date, proof_type);

alter table public.daily_random_missions enable row level security;

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
  v_application_date date := (now() at time zone 'Asia/Seoul')::date;
  v_start_date date;
begin
  select status, application_start_date, application_end_date, duration_days
    into v_challenge_status, v_application_start, v_application_end, v_duration_days
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

  v_start_date := v_application_date + 1;
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
