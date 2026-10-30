'use client';
import { useState } from 'react';
import { paymentConfig, proposedPrice } from './payment-config';
export default function Checkout({onClose}:{onClose:()=>void}) {
 const [notice,setNotice]=useState('');
 const ready=!!(paymentConfig.bank&&paymentConfig.holder&&paymentConfig.number);
 async function copy(){try{await navigator.clipboard.writeText(paymentConfig.number);setNotice('계좌번호를 복사했습니다. 은행 앱에서 직접 이체해 주세요.')}catch{setNotice('자동 복사가 지원되지 않습니다. 아래 번호를 길게 눌러 복사해 주세요.')}}
 return <div className="modal-backdrop"><section className="link-dialog checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="text-btn" onClick={onClose}>닫기 ×</button><span className="eyebrow">BANK TRANSFER</span><h2 id="checkout-title">계좌이체 안내</h2><p>우리의 초대 · 럭셔리 · 판매자 마플리</p><strong className="checkout-price">{proposedPrice.toLocaleString('ko-KR')}원</strong><p className="hint">초대장 1건 기준 이용 요금 · 정기결제 없음</p><div className="help-card"><b>공개 테스트 중 · 지금은 입금하지 마세요</b><p>아직 주문 접수와 입금 확인이 연결되지 않았습니다. 제작·저장·발행은 무료로 테스트할 수 있습니다.</p></div><dl className="bank-details"><div><dt>은행</dt><dd>{paymentConfig.bank||'등록 대기'}</dd></div><div><dt>예금주</dt><dd>{paymentConfig.holder||'등록 대기'}</dd></div><div><dt>계좌번호</dt><dd>{paymentConfig.number||'판매자 계좌 준비 중'}</dd></div></dl>{ready&&<input aria-label="복사용 계좌번호" readOnly value={paymentConfig.number} onFocus={e=>e.target.select()}/>}<button className="primary" disabled={!ready} onClick={copy}>계좌 복사하기</button>{!ready&&<p className="hint">계좌 등록 후 복사 버튼이 활성화됩니다.</p>}<p className="hint">계좌 복사만으로 이체되거나 결제가 완료되지 않습니다.</p><p role="status">{notice}</p></section></div>
}
