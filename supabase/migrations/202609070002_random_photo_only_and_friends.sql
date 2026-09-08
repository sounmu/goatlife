-- Random missions can be completed with a photo only. Morning proofs still
-- require a short note.
alter table public.proofs
  drop constraint proofs_content_check,
  add constraint proofs_content_length_check check (
    char_length(content) <= 140
    and (proof_type = 'RANDOM' or char_length(content) >= 1)
  );

-- A friendship is scoped to one challenge. Participant ids are stored in a
-- canonical order so the same pair cannot be inserted twice.
create table public.friendships (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  participant_one_id uuid not null references public.participants(id) on delete cascade,
  participant_two_id uuid not null references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (challenge_id, participant_one_id, participant_two_id),
  constraint friendships_distinct_participants_check check (participant_one_id < participant_two_id)
);

create index friendships_participant_one_idx
  on public.friendships (challenge_id, participant_one_id);
create index friendships_participant_two_idx
  on public.friendships (challenge_id, participant_two_id);

alter table public.friendships enable row level security;

-- No client-facing RLS policy is intentional. Friendship reads and writes are
-- authorized in Next.js server code with the service-role client.
