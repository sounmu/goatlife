import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "사진 이용규칙" };
export default function PhotoRulesPage() {
  return <LegalPage title="사진 이용규칙">
    <section><h2 className="font-extrabold">직접 촬영하거나 허락받은 사진</h2><p>본인이 촬영했거나 업로드와 참가자 공유에 필요한 권한을 받은 사진만 제출해 주세요. 다른 사람의 얼굴과 개인정보는 제외하거나 식별되지 않게 가려 주세요. 타인의 사진 도용, 불법 촬영물, 권리를 침해하는 사진은 올릴 수 없습니다.</p></section>
    <section><h2 className="font-extrabold">저작권과 서비스 이용허락</h2><p>사진의 저작권은 기존 권리자에게 남습니다. 참가자는 인증 확인과 같은 챌린지 참가자에게 표시하기 위해 필요한 범위에서 운영자에게 사진 저장·압축·전송·표시를 허락합니다. 이 허락은 사진 보관기간 동안 적용됩니다. 광고, 홍보 게시물 등 별도 목적의 사용에는 별도 허락을 받습니다.</p></section>
    <section><h2 className="font-extrabold">참가자 사진을 보호해 주세요</h2><p>피드 사진과 기록은 챌린지 참여 목적으로만 확인해 주세요. 권리자의 허락 없이 저장·캡처·외부 공유·재게시하거나 다른 용도로 이용하지 마세요. 별도로 저장한 사진은 늦어도 2026년 10월 4일에 삭제해 주세요.</p></section>
    <section><h2 className="font-extrabold">2026년 10월 4일 사진 삭제</h2><p>운영자는 한국시간 2026년 10월 4일에 이번 챌린지 인증 사진의 실제 저장 파일을 삭제합니다. 사진 삭제 후에도 정산에 필요한 인증 결과는 개인정보 처리방침에 정한 기간 동안 보관할 수 있습니다.</p></section>
    <section><h2 className="font-extrabold">신고·삭제 요청과 이의제기</h2><p>사진의 권리침해나 개인정보 노출을 발견하면 <a className="underline" href="mailto:sukkang_@korea.ac.kr">sukkang_@korea.ac.kr</a>으로 해당 인증 날짜·닉네임과 사유를 알려 주세요. 운영자는 사실관계를 확인하고 필요한 경우 노출 제한 또는 삭제하며, 처리 결과를 안내합니다. 처리에 이의가 있다면 같은 창구로 설명과 자료를 보내 주세요. 사진 삭제 요청에 따른 인증·정산 영향은 처리 전에 안내합니다.</p></section>
  </LegalPage>;
}
