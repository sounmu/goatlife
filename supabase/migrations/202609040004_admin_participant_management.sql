create or replace function public.delete_participant_data(p_participant_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_image_paths text[];
  v_deleted_participant_id uuid;
begin
  select coalesce(array_agg(distinct image_path), array[]::text[])
    into v_image_paths
    from public.proofs
    where participant_id = p_participant_id;

  delete from public.proofs
    where participant_id = p_participant_id;

  delete from public.challenge_participants
    where participant_id = p_participant_id;

  delete from public.participants
    where id = p_participant_id
    returning id into v_deleted_participant_id;

  if v_deleted_participant_id is null then
    raise exception 'participant_not_found';
  end if;

  return v_image_paths;
end;
$$;

revoke all on function public.delete_participant_data(uuid) from public;
grant execute on function public.delete_participant_data(uuid) to service_role;
