import "server-only";

import { signValue, verifySignedValue } from "@/lib/security";

interface FriendInvitePayload {
  challengeId: string;
  participantId: string;
}

export function createFriendInviteToken(payload: FriendInvitePayload) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return signValue(encoded);
}

export function readFriendInviteToken(token: string): FriendInvitePayload | null {
  const encoded = verifySignedValue(token);
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<FriendInvitePayload>;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!parsed.challengeId || !parsed.participantId) return null;
    if (!uuidPattern.test(parsed.challengeId) || !uuidPattern.test(parsed.participantId)) return null;
    return { challengeId: parsed.challengeId, participantId: parsed.participantId };
  } catch {
    return null;
  }
}
