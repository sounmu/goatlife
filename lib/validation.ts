import { z } from "zod";

export const photoConsentSchema = z.object({
  photoPrivacy: z.literal("on", { error: "사진 수집·이용에 동의해 주세요." }),
  photoSharing: z.literal("on", { error: "같은 챌린지 참가자에게 사진을 제공하는 데 동의해 주세요." }),
  photoRules: z.literal("on", { error: "사진 이용규칙에 동의해 주세요." }),
});

export const applySchema = photoConsentSchema.extend({
  challengeId: z.uuid("챌린지 정보가 올바르지 않습니다."),
  nickname: z.string().trim().min(2, "닉네임을 2자 이상 입력해 주세요.").max(20, "닉네임은 20자까지 입력할 수 있어요."),
  phone: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => /^01[016789]\d{7,8}$/.test(value), "올바른 휴대폰 번호를 입력해 주세요."),
  depositorName: z.string().trim().min(2, "입금자명을 입력해 주세요.").max(30, "입금자명이 너무 깁니다."),
  privacy: z.literal("on", { error: "개인정보 수집에 동의해 주세요." }),
});

export const recoveryLoginSchema = z.object({
  phone: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => /^01[016789]\d{7,8}$/.test(value), "올바른 휴대폰 번호를 입력해 주세요."),
  code: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{6}$/, "6자리 참가코드를 입력해 주세요."),
});

export const proofSchema = z.object({
  content: z.string().trim().max(140, "기록은 140자까지 입력할 수 있어요."),
  proofType: z.enum(["MORNING", "RANDOM"]),
  imageSource: z.enum(["CAMERA", "UPLOAD"]),
  missionId: z.string().optional(),
}).superRefine((value, context) => {
  if (value.proofType === "MORNING" && !value.content) {
    context.addIssue({
      code: "custom",
      path: ["content"],
      message: "오늘의 기록을 한 글자 이상 남겨 주세요.",
    });
  }
});

export const adminLoginSchema = z.object({
  email: z.email("이메일 형식을 확인해 주세요.").trim(),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const renameParticipantSchema = z.object({
  participantId: z.uuid("참가자 정보가 올바르지 않습니다."),
  nickname: z.string().trim().min(2, "닉네임을 2자 이상 입력해 주세요.").max(20, "닉네임은 20자까지 입력할 수 있어요."),
});

export const deleteParticipantSchema = z.object({
  participantId: z.uuid("참가자 정보가 올바르지 않습니다."),
  confirmation: z.string().trim().min(1, "삭제할 참가자 이름을 입력해 주세요."),
});

export function fieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
