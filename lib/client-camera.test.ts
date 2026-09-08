import { describe, expect, it, vi } from "vitest";
import { cameraErrorMessage, openCamera } from "./client-camera";

describe("camera access", () => {
  it("falls back to the default camera when constraints fail", async () => {
    const stream = {} as MediaStream;
    const getUserMedia = vi.fn()
      .mockRejectedValueOnce(new DOMException("", "OverconstrainedError"))
      .mockResolvedValueOnce(stream);
    await expect(openCamera({ getUserMedia })).resolves.toBe(stream);
    expect(getUserMedia).toHaveBeenLastCalledWith({ video: true, audio: false });
  });

  it.each(["NotAllowedError", "NotReadableError"])("does not repeat a %s request", async (name) => {
    const error = new DOMException("", name);
    const getUserMedia = vi.fn().mockRejectedValue(error);
    await expect(openCamera({ getUserMedia })).rejects.toBe(error);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("reports the final failure when the default camera also fails", async () => {
    const error = new DOMException("", "NotReadableError");
    const getUserMedia = vi.fn()
      .mockRejectedValueOnce(new DOMException("", "NotFoundError"))
      .mockRejectedValueOnce(error);
    await expect(openCamera({ getUserMedia })).rejects.toBe(error);
  });

  it("explains OS permissions on Mac without calling hardware failures permission denials", () => {
    expect(cameraErrorMessage({ name: "NotAllowedError" }, true)).toContain("Mac 시스템 설정");
    expect(cameraErrorMessage({ name: "NotReadableError" }, true)).toContain("다른 앱이나 탭");
    expect(cameraErrorMessage({ name: "NotFoundError" }, true)).toContain("카메라 연결");
    expect(cameraErrorMessage(new Error("unknown"), true)).not.toContain("허용");
  });
});
