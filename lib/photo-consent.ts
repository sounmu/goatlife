export const PHOTO_CONSENT_VERSION = "2026-09-05-challenge";

export function hasPhotoConsent(consent: { photo_consent_version: string | null; photo_consent_at: string | null } | null) {
  return consent?.photo_consent_version === PHOTO_CONSENT_VERSION && Boolean(consent.photo_consent_at);
}
