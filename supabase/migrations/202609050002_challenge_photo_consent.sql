-- Consent applies to future uploads for this participation, not older photos.
alter table public.challenge_participants
  add column photo_consent_version text,
  add column photo_consent_at timestamptz,
  add column application_consent_version text,
  add column application_consent_at timestamptz;

create function public.apply_to_challenge_with_consent(
  p_challenge_id uuid,
  p_nickname text,
  p_phone text,
  p_depositor_name text,
  p_consent_version text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant_id uuid;
begin
  if p_consent_version is distinct from '2026-09-05-challenge' then
    raise exception 'invalid_consent_version';
  end if;
  -- Both operations commit or roll back together.
  v_participant_id := public.apply_to_challenge(p_challenge_id, p_nickname, p_phone, p_depositor_name);
  update public.challenge_participants
    set photo_consent_version = p_consent_version,
        photo_consent_at = now(),
        application_consent_version = p_consent_version,
        application_consent_at = now()
    where participant_id = v_participant_id and challenge_id = p_challenge_id;
  if not found then raise exception 'participation_not_found'; end if;
  return v_participant_id;
end;
$$;
revoke all on function public.apply_to_challenge_with_consent(uuid, text, text, text, text) from public;
grant execute on function public.apply_to_challenge_with_consent(uuid, text, text, text, text) to service_role;

create function public.accept_challenge_photo_consent(
  p_participation_id uuid,
  p_participant_id uuid,
  p_consent_version text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_consent_version is distinct from '2026-09-05-challenge' then
    raise exception 'invalid_consent_version';
  end if;
  perform 1 from public.challenge_participants
    where id = p_participation_id and participant_id = p_participant_id for update;
  if not found then raise exception 'participation_not_found'; end if;
  update public.challenge_participants
    set photo_consent_version = p_consent_version, photo_consent_at = now()
    where id = p_participation_id and participant_id = p_participant_id
      and (photo_consent_version is distinct from p_consent_version or photo_consent_at is null);
end;
$$;
revoke all on function public.accept_challenge_photo_consent(uuid, uuid, text) from public;
grant execute on function public.accept_challenge_photo_consent(uuid, uuid, text) to service_role;
