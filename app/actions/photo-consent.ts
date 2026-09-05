"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireParticipant } from "@/lib/auth/participant";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PHOTO_CONSENT_VERSION } from "@/lib/photo-consent";
import { photoConsentSchema, fieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/domain";

export async function acceptPhotoConsent(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireParticipant();
  const parsed = photoConsentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "사진 관련 동의 항목을 각각 확인해 주세요." };
  const { error } = await getSupabaseAdmin().rpc("accept_challenge_photo_consent", {
    p_participation_id: session.challengeParticipantId,
    p_participant_id: session.id,
    p_consent_version: PHOTO_CONSENT_VERSION,
  });
  if (error) return { message: "동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  revalidatePath("/proof/new");
  redirect("/proof/new");
}
