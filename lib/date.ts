import type { Challenge, ParticipantStats } from "@/lib/domain";

export const KOREA_TIME_ZONE = "Asia/Seoul";

function parts(date: Date) {
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(values.map(({ type, value }) => [type, value]));
}

export function koreaDate(date = new Date()) {
  const value = parts(date);
  return `${value.year}-${value.month}-${value.day}`;
}

export function koreaMinutes(date = new Date()) {
  const value = parts(date);
  return Number(value.hour) * 60 + Number(value.minute);
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

export function isWithinProofWindow(start: string, end: string, date = new Date()) {
  const now = koreaMinutes(date);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes <= endMinutes) return now >= startMinutes && now <= endMinutes;
  return now >= startMinutes || now <= endMinutes;
}

function dayNumber(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function inclusiveDays(start: string, end: string) {
  return Math.max(0, dayNumber(end) - dayNumber(start) + 1);
}

export function shiftDate(date: string, days: number) {
  return new Date((dayNumber(date) + days) * 86_400_000).toISOString().slice(0, 10);
}

export function proofDateForWindow(start: string, end: string, date = new Date()) {
  const today = koreaDate(date);
  if (timeToMinutes(start) > timeToMinutes(end) && koreaMinutes(date) <= timeToMinutes(end)) {
    return shiftDate(today, -1);
  }
  return today;
}

export function lastClosedProofDate(start: string, end: string, date = new Date()) {
  const today = koreaDate(date);
  const now = koreaMinutes(date);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes <= endMinutes) return now > endMinutes ? today : shiftDate(today, -1);
  return now <= endMinutes ? shiftDate(today, -2) : shiftDate(today, -1);
}

export function hasFailed(failureCount: number, maxFailures: number, rule: Challenge["failure_rule"]) {
  return rule === "ABOVE" ? failureCount > maxFailures : failureCount >= maxFailures;
}

export function calculateStats(
  challenge: Pick<Challenge, "start_date" | "end_date" | "max_failures" | "failure_rule">,
  validProofDates: string[],
  today = koreaDate(),
): ParticipantStats {
  const lastEligibleDate = today < challenge.end_date ? today : challenge.end_date;
  const eligibleDays = today < challenge.start_date ? 0 : inclusiveDays(challenge.start_date, lastEligibleDate);
  const uniqueProofs = new Set(validProofDates.filter((date) => date >= challenge.start_date && date <= lastEligibleDate));
  const successCount = uniqueProofs.size;
  const failureCount = Math.max(0, eligibleDays - successCount);
  const failed = hasFailed(failureCount, challenge.max_failures, challenge.failure_rule);
  const remainingFailures = challenge.failure_rule === "ABOVE"
    ? Math.max(0, challenge.max_failures - failureCount)
    : Math.max(0, challenge.max_failures - failureCount - 1);

  return { eligibleDays, successCount, failureCount, remainingFailures, hasFailed: failed };
}

export function calculateLiveStats(
  challenge: Pick<Challenge, "start_date" | "end_date" | "max_failures" | "failure_rule" | "proof_start_time" | "proof_end_time">,
  validProofDates: string[],
  now = new Date(),
) {
  const closedStats = calculateStats(
    challenge,
    validProofDates,
    lastClosedProofDate(challenge.proof_start_time, challenge.proof_end_time, now),
  );
  const currentProofDate = proofDateForWindow(challenge.proof_start_time, challenge.proof_end_time, now);
  const lastStartedDate = currentProofDate < challenge.end_date ? currentProofDate : challenge.end_date;
  const eligibleDays = currentProofDate < challenge.start_date
    ? 0
    : inclusiveDays(challenge.start_date, lastStartedDate);
  const successCount = currentProofDate < challenge.start_date
    ? 0
    : new Set(validProofDates.filter((date) => date >= challenge.start_date && date <= lastStartedDate)).size;

  return {
    ...closedStats,
    eligibleDays,
    successCount,
  };
}

export function calculateStreak(dates: string[], endingAt: string) {
  const dateSet = new Set(dates);
  let cursor = dayNumber(endingAt);
  let streak = 0;
  while (dateSet.has(new Date(cursor * 86_400_000).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export function formatKoreaDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: KOREA_TIME_ZONE })
    .format(new Date(`${date}T12:00:00+09:00`));
}

export function formatKoreaDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TIME_ZONE,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}
