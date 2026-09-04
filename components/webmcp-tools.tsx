"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function WebMcpTools() {
  const router = useRouter();
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "start_challenge_application",
      title: "챌린지 참가 신청 시작",
      description: "GOAT.MORNING 참가 신청 화면으로 이동해 닉네임, 전화번호, 입금자명을 입력할 수 있게 합니다. 신청을 제출하지는 않습니다.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        router.push("/apply");
        return { status: "navigating", destination: "/apply" };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [router]);
  return null;
}
