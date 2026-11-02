import type { Metadata } from 'next';
import Link from 'next/link';
import { keepOpen } from '../payment-config';
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
  <h2>{keepOpen?'열람 기간과 영구보관':'열람 기간'}</h2>
  <ol>
    <li>발행한 초대장은 예식일 다음 날부터 30일간 열람할 수 있습니다. 기간이 끝나면 하객에게는 "기간이 끝난 초대장" 안내만 보입니다.</li>
    <li>기간이 끝나고 7일이 지나면 초대장에 올린 사진·음악·영상과 하객이 올린 사진이 자동으로 삭제되며, 삭제된 파일은 되살릴 수 없습니다. 필요한 사진은 미리 내려받아 주세요.</li>
    {keepOpen&&<><li>영구보관(유료)을 신청하면 초대장이 기간 없이 계속 열립니다. 기간이 끝난 뒤에도 삭제 전 7일 안에 신청하면 다시 열립니다. 하객이 올린 사진은 영구보관에 포함되지 않으니 미리 내려받아 주세요.</li>
    <li>영구보관은 결제 즉시 적용되는 디지털 서비스로, 결제 후 7일 이내이고 아직 열람 기간이 끝나지 않은 경우에만 전액 환불해 드립니다.</li></>}
  </ol>
  <p className="hint">운영: 마플리 · 대표 이두형 · 사업자등록번호 537-20-02420 · 통신판매업 신고 제2026-대전유성-0433호<br/>사업장: 대전광역시 유성구 온천북로13번길 21, 725호(봉명동, 스카이뷰시티) · 전화 010-5814-5551 · korealeedo@naver.com</p>
</main>}
