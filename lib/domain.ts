export type PaymentStatus = "WAITING" | "PAID";
export type ParticipantStatus = "APPLIED" | "ACTIVE" | "SUCCESS" | "FAILED" | "REFUNDED";
export type ProofStatus = "VALID" | "INVALID";
export type ChallengeStatus = "DRAFT" | "OPEN" | "ACTIVE" | "ENDED";
export type FailureRule = "AT_OR_ABOVE" | "ABOVE";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  max_failures: number;
  failure_rule: FailureRule;
  proof_start_time: string;
  proof_end_time: string;
  status: ChallengeStatus;
}

export interface ParticipantIdentity {
  id: string;
  nickname: string;
}

export interface ParticipantSession extends ParticipantIdentity {
  challengeParticipantId: string;
  challengeId: string;
  participantStatus: ParticipantStatus;
}

export interface ParticipantStats {
  eligibleDays: number;
  successCount: number;
  failureCount: number;
  remainingFailures: number;
  hasFailed: boolean;
}

export interface ActionState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  data?: Record<string, string>;
}
