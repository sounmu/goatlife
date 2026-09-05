-- NULL means no recorded consent; do not backfill consent for existing photos.
alter table public.proofs
  add column photo_consent_version text,
  add column photo_consent_at timestamptz;
