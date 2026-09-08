import { describe, expect, it } from "vitest";
import { proofSchema } from "./validation";

describe("proofSchema", () => {
  it("allows a random mission with a photo and no note", () => {
    expect(proofSchema.safeParse({
      content: "",
      proofType: "RANDOM",
      imageSource: "UPLOAD",
      missionId: "mission-id",
    }).success).toBe(true);
  });

  it("still requires a note for a morning proof", () => {
    const result = proofSchema.safeParse({
      content: "   ",
      proofType: "MORNING",
      imageSource: "CAMERA",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.content).toContain("오늘의 기록을 한 글자 이상 남겨 주세요.");
  });
});
