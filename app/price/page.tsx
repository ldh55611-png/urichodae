import type { Metadata } from 'next';
import Link from 'next/link';
import { proposedPrice,keepPrice,productName,keepProductName,keepOpen } from '../payment-config';
export const metadata:Metadata={title:'상품 안내 | 우리의 초대',description:'우리의 초대 모바일 청첩장·돌잔치 초대장 발행 상품과 가격, 제공 기간 안내',alternates:{canonical:'/price'}};
const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
// 결제 대행사(토스페이먼츠) 심사용 상품 안내 페이지. 가격·판매 여부는 payment-config.ts, 열람 기간은 retention.ts를 따릅니다.
export default function Price(){return <main className="policy price-page">
  <Link href="/" className="text-btn">← 우리의 초대</Link>
  <h1>상품 안내</h1>
  <p>우리의 초대는 모바일 청첩장과 돌잔치 초대장을 직접 만들어 휴대폰 주소(링크)로 하객에게 보내는 디지털 서비스입니다. 회원가입 없이 만들 수 있고, 다 만든 뒤 발행할 때 결제합니다. 배송 상품이 없습니다.</p>

  <section className="price-card">
    <h2>{productName}</h2>
    <strong className="checkout-price">{won(proposedPrice)}</strong>
    <ul>
      <li>초대장 1건 발행 · 1회 결제 · 정기결제·추가 요금 없음</li>
      <li>포함: 디자인 스타일 8종, 사진 갤러리, 배경음악, 지도·길찾기, 마음 전할 곳(계좌), 참석 여부, 방명록, 하객 사진 받기, 카카오톡 공유</li>
      <li>발행하면 전용 주소(urichodae.com/i/…)가 만들어지고, 결제 후에도 내용 수정은 횟수 제한 없이 할 수 있습니다.</li>
      <li><b>제공 기간:</b> 결제(발행) 시점부터 예식일(행사일) 다음 날 30일째까지 열람할 수 있습니다. 예식일(행사일)이 결제일로부터 11개월 이내인 초대장만 발행할 수 있어, 최대 제공 기간은 결제일로부터 12개월입니다.</li>
    </ul>
  </section>

  {keepOpen&&<section className="price-card">
    <h2>{keepProductName} (선택)</h2>
    <strong className="checkout-price">{won(keepPrice)}</strong>
    <ul>
      <li>예식(행사)이 끝난 뒤에도 초대장(사진·음악·글)을 계속 열람할 수 있게 합니다. 하객이 올린 사진은 포함되지 않습니다.</li>
      <li>발행할 때 함께 결제하면 합계 {won(proposedPrice+keepPrice)}입니다.</li>
    </ul>
  </section>}

  <h2>결제 방법</h2>
  <ol>
    <li>메인 화면에서 ‘청첩장 만들기’ 또는 ‘돌잔치 초대장 만들기’를 누릅니다.</li>
    <li>내용과 사진을 입력한 뒤 ‘결제하고 발행하기’를 누릅니다.</li>
    <li>토스페이먼츠 결제창에서 카드·간편결제로 결제하면 바로 발행되고 공유 주소가 나옵니다.</li>
  </ol>
  <p>환불 기준은 <Link href="/refund">환불 정책</Link>에서 확인해 주세요.</p>
  <p className="hint">운영: 마플리 · 대표 이두형 · 사업자등록번호 537-20-02420 · 통신판매업 신고 제2026-대전유성-0433호<br/>사업장: 대전광역시 유성구 온천북로13번길 21, 725호(봉명동, 스카이뷰시티) · 전화 010-5814-5551 · korealeedo@naver.com</p>
</main>}
