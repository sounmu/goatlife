import { afterEach, describe, expect, it, vi } from "vitest";
import { createFriendInviteToken, readFriendInviteToken } from "./friend-invites";
import { signValue } from "./security";

vi.mock("server-only", () => ({}));

const payload = {
  challengeId: "01234567-89ab-4cde-8fab-0123456789ab",
  participantId: "abcdef01-2345-4678-9abc-def012345678",
};

afterEach(() => vi.unstubAllEnvs());

describe("friend invite tokens", () => {
  it("round trips both IDs in 90 URL-safe characters and preserves the login return path", () => {
    const token = createFriendInviteToken(payload);
    expect(token).toHaveLength(90);
    expect(readFriendInviteToken(token)).toEqual(payload);
    const path = `/friends/add/${token}`;
    expect(path).toMatch(/^\/friends\/add\/[A-Za-z0-9._-]+$/);
    expect(new URLSearchParams(`next=${encodeURIComponent(path)}`).get("next")).toBe(path);
  });

  it("still reads previously shared JSON tokens", () => {
    const token = signValue(Buffer.from(JSON.stringify(payload)).toString("base64url"));
    expect(token).toHaveLength(190);
    expect(readFriendInviteToken(token)).toEqual(payload);
  });

  it("rejects every single-character change, including changes to either ID or the signature", () => {
    const token = createFriendInviteToken(payload);
    for (let i = 0; i < token.length; i++) {
      const changed = token.slice(0, i) + (token[i] === "A" ? "B" : "A") + token.slice(i + 1);
      expect(readFriendInviteToken(changed)).toBeNull();
    }
  });

  it("rejects signatures from a different secret", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "first-test-secret");
    const token = createFriendInviteToken(payload);
    vi.stubEnv("ADMIN_SESSION_SECRET", "second-test-secret");
    expect(readFriendInviteToken(token)).toBeNull();
  });

  it.each(["", "invalid", "f2_unknown", "f1_AA", `f1_${Buffer.alloc(32).toString("base64url")}`, Buffer.from("null").toString("base64url"), Buffer.from(JSON.stringify({ ...payload, participantId: "invalid" })).toString("base64url")])(
    "rejects malformed payloads even with a valid signature: %s",
    (value) => expect(readFriendInviteToken(signValue(value))).toBeNull(),
  );

  it("rejects invalid IDs before packing and normalizes valid uppercase UUIDs", () => {
    expect(() => createFriendInviteToken({ ...payload, challengeId: "invalid" })).toThrow();
    expect(readFriendInviteToken(createFriendInviteToken({
      challengeId: payload.challengeId.toUpperCase(),
      participantId: payload.participantId.toUpperCase(),
    }))).toEqual(payload);
  });
});
