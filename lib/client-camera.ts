function errorName(error: unknown): string {
  return typeof error === "object" && error !== null && "name" in error
    ? String(error.name)
    : "";
}

export async function openCamera(mediaDevices: Pick<MediaDevices, "getUserMedia">): Promise<MediaStream> {
  try {
    return await mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 2560 }, height: { ideal: 1920 } },
      audio: false,
    });
  } catch (error) {
    // Some cameras cannot satisfy facing-mode constraints. Let the browser
    // choose its default camera, but never retry a permission denial.
    if (!["OverconstrainedError", "ConstraintNotSatisfiedError", "NotFoundError", "DevicesNotFoundError"].includes(errorName(error))) throw error;
    return mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

export function cameraErrorMessage(error: unknown, isMac: boolean): string {
  switch (errorName(error)) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "카메라 접근이 차단되어 있어요. 주소창의 사이트 설정에서 카메라를 허용해 주세요."
        + (isMac ? " 이미 허용했다면 Mac 시스템 설정 → 개인정보 보호 및 보안 → 카메라에서 사용 중인 브라우저(웨일 등)를 켜고, 브라우저를 완전히 종료한 뒤 다시 실행해 주세요." : " 기기 설정에서도 브라우저의 카메라 접근이 허용되어 있는지 확인해 주세요.");
    case "NotReadableError":
    case "TrackStartError":
      return "카메라에 연결하지 못했어요. 다른 앱이나 탭에서 카메라를 사용 중이라면 종료하고, 카메라 연결 상태를 확인한 뒤 다시 시도해 주세요.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "사용 가능한 카메라를 찾지 못했어요. 카메라 연결과 브라우저의 기본 카메라 설정을 확인해 주세요.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "이 카메라가 촬영 설정을 지원하지 않아요. 브라우저 설정에서 다른 카메라를 선택해 주세요.";
    case "SecurityError":
      return "브라우저 보안 설정에서 카메라 사용이 제한되어 있어요. 사이트와 브라우저의 보안 설정을 확인해 주세요.";
    default:
      return "카메라를 시작하지 못했어요. 잠시 후 다시 시도하거나 브라우저를 다시 실행해 주세요.";
  }
}
