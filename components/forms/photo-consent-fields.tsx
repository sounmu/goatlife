export function PhotoConsentFields() {
  return (
      <fieldset className="space-y-3 rounded-2xl bg-cream p-4 text-xs leading-6 text-ink/75">
        <legend className="font-bold">사진 이용 및 공개 동의</legend>
        <p>이번 챌린지에서 앞으로 제출할 사진과 기록에 대해 한 번 동의합니다. 사진 파일은 2026년 10월 4일(한국시간)에 삭제합니다. 동의를 거부할 수 있으나 사진 인증을 제출할 수 없습니다.</p>
        <label className="flex items-start gap-2"><input type="checkbox" name="photoPrivacy" required className="mt-1 accent-coral" /><span>[필수] 인증 확인을 위한 사진·한 줄 기록·인증 날짜 및 촬영 방식의 수집·이용에 동의합니다. 사진 외 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내 삭제하며 법정 보관 의무가 있는 기록은 해당 기간 보관합니다.</span></label>
        <label className="flex items-start gap-2"><input type="checkbox" name="photoSharing" required className="mt-1 accent-coral" /><span>[필수] 같은 챌린지 참가자에게 공동 인증 확인과 응원을 위해 사진·닉네임·한 줄 기록·인증 날짜를 제공하는 데 동의합니다. 사진의 제공 및 이용기간은 2026년 10월 4일 삭제 전까지입니다. 다른 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내까지 이용됩니다.</span></label>
        <label className="flex items-start gap-2"><input type="checkbox" name="photoRules" required className="mt-1 accent-coral" /><span>[필수] 사진 이용규칙에 동의하며, 제출·공유할 권한이 있는 사진만 올리고 타인의 권리를 침해하지 않겠습니다.</span></label>
        <p><a href="/privacy" target="_blank" rel="noreferrer" className="underline">개인정보 처리방침 (새 창)</a> · <a href="/photo-rules" target="_blank" rel="noreferrer" className="underline">사진 이용규칙 (새 창)</a></p>
      </fieldset>
  );
}
