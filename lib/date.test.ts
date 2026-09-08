import { describe, expect, it } from "vitest";
import { calculateLiveStats, calculateStats, hasFailed, isDateWithin, isWithinProofWindow, koreaDate, participantPeriodForApplication, proofDateForWindow } from "./date";

const challenge = {
  start_date: "2026-09-10",
  end_date: "2026-09-30",
  max_failures: 3,
  failure_rule: "AT_OR_ABOVE" as const,
};

describe("KST proof rules", () => {
  it("uses the Korea calendar date", () => {
    expect(koreaDate(new Date("2026-09-09T15:01:00Z"))).toBe("2026-09-10");
  });

  it("accepts the configured morning window inclusively", () => {
    expect(isWithinProofWindow("05:00", "09:00", new Date("2026-09-09T20:00:00Z"))).toBe(true);
    expect(isWithinProofWindow("05:00", "09:00", new Date("2026-09-10T00:00:00Z"))).toBe(true);
    expect(isWithinProofWindow("05:00", "09:00", new Date("2026-09-10T00:01:00Z"))).toBe(false);
  });

  it("supports proof windows crossing midnight", () => {
    expect(isWithinProofWindow("22:00", "02:00", new Date("2026-09-09T14:30:00Z"))).toBe(true);
    expect(isWithinProofWindow("22:00", "02:00", new Date("2026-09-09T08:00:00Z"))).toBe(false);
  });

  it("assigns after-midnight proofs to the window's starting date", () => {
    expect(proofDateForWindow("22:00", "02:00", new Date("2026-09-09T16:00:00Z"))).toBe("2026-09-09");
  });
});

describe("failure calculation", () => {
  it("counts elapsed days without a valid proof", () => {
    expect(calculateStats(challenge, ["2026-09-10", "2026-09-11", "2026-09-13"], "2026-09-14")).toEqual({
      eligibleDays: 5,
      successCount: 3,
      failureCount: 2,
      remainingFailures: 0,
      hasFailed: false,
    });
  });

  it("switches between inclusive and exclusive failure policies", () => {
    expect(hasFailed(3, 3, "AT_OR_ABOVE")).toBe(true);
    expect(hasFailed(3, 3, "ABOVE")).toBe(false);
    expect(hasFailed(4, 3, "ABOVE")).toBe(true);
  });

  it("does not count today as failed before the proof window closes", () => {
    const liveChallenge = { ...challenge, proof_start_time: "05:00", proof_end_time: "09:00" };
    const beforeClose = calculateLiveStats(liveChallenge, ["2026-09-10", "2026-09-11"], new Date("2026-09-10T21:00:00Z"));
    expect(beforeClose.eligibleDays).toBe(2);
    expect(beforeClose.successCount).toBe(2);
    expect(beforeClose.failureCount).toBe(0);
  });
});

describe("participant-specific challenge period", () => {
  it("starts on September 6 for early applicants, then the day after applying", () => {
    expect(participantPeriodForApplication("2026-09-04", 14, "2026-09-06")).toEqual({
      startDate: "2026-09-06",
      endDate: "2026-09-19",
    });
    expect(participantPeriodForApplication("2026-09-05", 14, "2026-09-06")).toEqual({
      startDate: "2026-09-06",
      endDate: "2026-09-19",
    });
    expect(participantPeriodForApplication("2026-09-06", 14, "2026-09-06")).toEqual({
      startDate: "2026-09-07",
      endDate: "2026-09-20",
    });
    expect(participantPeriodForApplication("2026-09-13", 14, "2026-09-06")).toEqual({
      startDate: "2026-09-14",
      endDate: "2026-09-27",
    });
  });

  it("treats both application-period boundaries as inclusive", () => {
    expect(isDateWithin("2026-09-04", "2026-09-04", "2026-09-13")).toBe(true);
    expect(isDateWithin("2026-09-13", "2026-09-04", "2026-09-13")).toBe(true);
    expect(isDateWithin("2026-09-14", "2026-09-04", "2026-09-13")).toBe(false);
  });
});
