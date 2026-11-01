import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata:Metadata={title:'환불 정책 | 우리의 초대',description:'우리의 초대 모바일 초대장 결제 환불 정책',alternates:{canonical:'/refund'}};
export default function Refund(){return <main className="policy">
  <Link href="/" className="text-btn">← 우리의 초대</Link>
  <h1>환불 정책</h1>
  <ol>
    <li>결제 후 7일 이내이고, 발행된 초대장 주소를 아직 하객에게 보내지 않은 경우 전액 환불해 드립니다.</li>
    <li>초대장 주소를 하객에게 보내 열람이 시작된 뒤에는 디지털 콘텐츠 특성상 환불이 어렵습니다. (전자상거래 등에서의 소비자보호에 관한 법률 제17조 제2항 제5호)</li>
    <li>서비스 장애로 초대장을 이용하지 못한 경우에는 기간과 관계없이 전액 환불해 드립니다.</li>
    <li>환불 신청: <a href="mailto:korealeedo@naver.com">korealeedo@naver.com</a> (주문자 이름, 결제일, 초대장 주소를 적어 주세요)</li>
    <li>환불은 신청일로부터 3영업일 이내에 결제하신 수단으로 처리됩니다.</li>
  </ol>
  <p className="hint">운영: 마플리 · 대표 이두형 · 사업자등록번호 537-20-02420 · 통신판매업 신고 제2026-대전유성-0433호</p>
</main>}
