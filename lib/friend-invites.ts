import "server-only";

import { signValue, verifySignedValue } from "./security";

interface FriendInvitePayload {
  challengeId: string;
  participantId: string;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const compactPrefix = "f1_";

function unpackUuid(bytes: Buffer) {
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createFriendInviteToken(payload: FriendInvitePayload) {
  if (!uuidPattern.test(payload.challengeId) || !uuidPattern.test(payload.participantId)) {
    throw new Error("Invalid friend invite IDs");
  }
  // Two UUIDs need only 32 bytes. Keep the full HMAC and sign the format version too.
  const packed = Buffer.from(`${payload.challengeId}${payload.participantId}`.replaceAll("-", ""), "hex");
  return signValue(`${compactPrefix}${packed.toString("base64url")}`);
}

export function readFriendInviteToken(token: string): FriendInvitePayload | null {
  const encoded = verifySignedValue(token);
  if (!encoded) return null;

  try {
    if (encoded.startsWith(compactPrefix)) {
      const value = encoded.slice(compactPrefix.length);
      const packed = Buffer.from(value, "base64url");
      if (packed.length !== 32 || packed.toString("base64url") !== value) return null;
      const challengeId = unpackUuid(packed.subarray(0, 16));
      const participantId = unpackUuid(packed.subarray(16, 32));
      if (!uuidPattern.test(challengeId) || !uuidPattern.test(participantId)) return null;
      return { challengeId, participantId };
    }

    // Previously shared JSON-based links remain valid.
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<FriendInvitePayload>;
    if (!parsed.challengeId || !parsed.participantId) return null;
    if (!uuidPattern.test(parsed.challengeId) || !uuidPattern.test(parsed.participantId)) return null;
    return { challengeId: parsed.challengeId, participantId: parsed.participantId };
  } catch {
    return null;
  }
}
