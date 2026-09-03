create extension if not exists pgcrypto;

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  deposit_amount integer not null check (deposit_amount >= 0),
  start_date date not null,
  end_date date not null,
  max_failures integer not null default 3 check (max_failures >= 0),
  failure_rule text not null default 'AT_OR_ABOVE' check (failure_rule in ('AT_OR_ABOVE', 'ABOVE')),
  proof_start_time time not null default '00:00',
  proof_end_time time not null default '23:59',
  status text not null default 'DRAFT' check (status in ('DRAFT', 'OPEN', 'ACTIVE', 'ENDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 20),
  phone text not null unique check (phone ~ '^01[016789][0-9]{7,8}$'),
  depositor_name text not null,
  recovery_code_hash text,
  recovery_code_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  participant_id uuid not null references public.participants(id) on delete restrict,
  payment_status text not null default 'WAITING' check (payment_status in ('WAITING', 'PAID')),
  participant_status text not null default 'APPLIED' check (participant_status in ('APPLIED', 'ACTIVE', 'SUCCESS', 'FAILED', 'REFUNDED')),
  joined_at timestamptz not null default now(),
  activated_at timestamptz,
  refunded_at timestamptz,
  unique (challenge_id, participant_id)
);

create table public.participant_tokens (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz
);

create table public.participant_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create table public.proofs (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  proof_date date not null,
  image_path text not null,
  content text not null check (char_length(content) between 1 and 140),
  created_at timestamptz not null default now(),
  status text not null default 'VALID' check (status in ('VALID', 'INVALID')),
  invalidated_at timestamptz,
  unique (participant_id, challenge_id, proof_date)
);

create index challenge_participants_status_idx on public.challenge_participants (challenge_id, participant_status);
create index participant_tokens_lookup_idx on public.participant_tokens (token_hash) where revoked_at is null;
create index participant_sessions_lookup_idx on public.participant_sessions (token_hash) where revoked_at is null;
create index proofs_feed_idx on public.proofs (challenge_id, created_at desc) where status = 'VALID';
create index proofs_participant_idx on public.proofs (participant_id, challenge_id, proof_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger challenges_set_updated_at before update on public.challenges
for each row execute function public.set_updated_at();
create trigger participants_set_updated_at before update on public.participants
for each row execute function public.set_updated_at();

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
begin
  select status into v_challenge_status from public.challenges where id = p_challenge_id for share;
  if v_challenge_status is distinct from 'OPEN' then
    raise exception 'challenge_not_open';
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

  insert into public.challenge_participants (challenge_id, participant_id)
  values (p_challenge_id, v_participant_id);
  return v_participant_id;
end;
$$;

revoke all on function public.apply_to_challenge(uuid, text, text, text) from public;
grant execute on function public.apply_to_challenge(uuid, text, text, text) to service_role;

alter table public.challenges enable row level security;
alter table public.participants enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.participant_tokens enable row level security;
alter table public.participant_sessions enable row level security;
alter table public.proofs enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proof-images',
  'proof-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No client-facing RLS policies are intentional. The browser never receives the
-- service-role key; every read and mutation is authorized in Next.js server code.
