import { describe, expect, it } from "vitest";
import { hasPhotoConsent, PHOTO_CONSENT_VERSION } from "./photo-consent";
import { applySchema, photoConsentSchema } from "./validation";

describe("one-time challenge consent", () => {
  it("requires the current version and a recorded time", () => {
    expect(hasPhotoConsent(null)).toBe(false);
    expect(hasPhotoConsent({ photo_consent_version: PHOTO_CONSENT_VERSION, photo_consent_at: null })).toBe(false);
    expect(hasPhotoConsent({ photo_consent_version: "2026-09-05", photo_consent_at: "2026-09-05T00:00:00Z" })).toBe(false);
    expect(hasPhotoConsent({ photo_consent_version: PHOTO_CONSENT_VERSION, photo_consent_at: "2026-09-05T00:00:00Z" })).toBe(true);
  });
  it("requires each separate consent for existing participants", () => {
    const consent = { photoPrivacy: "on", photoSharing: "on", photoRules: "on" };
    expect(photoConsentSchema.safeParse(consent).success).toBe(true);
    for (const key of Object.keys(consent)) {
      expect(photoConsentSchema.safeParse({ ...consent, [key]: undefined }).success).toBe(false);
    }
  });
  it("rejects applications missing photo sharing consent", () => {
    const application = { challengeId: "11111111-1111-4111-8111-111111111111", nickname: "참가자", phone: "01012345678", depositorName: "참가자", privacy: "on", photoPrivacy: "on", photoSharing: "on", photoRules: "on" };
    expect(applySchema.safeParse(application).success).toBe(true);
    expect(applySchema.safeParse({ ...application, photoSharing: undefined }).success).toBe(false);
  });
});
