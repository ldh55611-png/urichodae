'use client';
import { useEffect,useRef,useState } from 'react';
import { proposedPrice,keepPrice } from './payment-config';
type Widgets={setAmount(a:{currency:string;value:number}):Promise<void>;renderPaymentMethods(o:{selector:string;variantKey?:string}):Promise<unknown>;renderAgreement(o:{selector:string;variantKey?:string}):Promise<unknown>;requestPayment(o:{orderId:string;orderName:string;successUrl:string;failUrl:string}):Promise<void>};
type TossFactory=((clientKey:string)=>{widgets(o:{customerKey:string}):Widgets})&{ANONYMOUS:string};
declare global{interface Window{TossPayments?:TossFactory}}
let sdk:Promise<TossFactory>|null=null;
function loadSdk(){if(window.TossPayments)return Promise.resolve(window.TossPayments);sdk??=new Promise((ok,fail)=>{const s=document.createElement('script');s.src='https://js.tosspayments.com/v2/standard';s.onload=()=>window.TossPayments?ok(window.TossPayments):fail(Error('결제창을 불러오지 못했어요.'));s.onerror=()=>{sdk=null;fail(Error('결제창을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'))};document.head.appendChild(s)});return sdk}
type Order={orderId:string;amount:number;orderName:string;clientKey:string;mode:'test'|'live'};
const copy={
  publish:{title:'발행하고 바로 보내기',note:'초대장 1건 · 한 번 결제로 계속 수정 가능 · 정기결제 없음',terms:'예식일 다음 날부터 30일간 열람할 수 있어요. 이후에도 계속 보려면 영구보관을 신청해 주세요.',price:proposedPrice,button:'결제하고 발행하기'},
  keep:{title:'영구보관하기',note:'기간 없이 계속 열람 · 한 번 결제 · 정기결제 없음',terms:'초대장(사진·음악·글)은 기간 없이 계속 열려요. 하객이 올린 사진은 포함되지 않으니 미리 내려받아 주세요.',price:keepPrice,button:'결제하고 영구보관하기'}
} as const;
// 토스페이먼츠 결제위젯: 카드·카카오페이·네이버페이·토스페이 등을 한 화면에서 고릅니다.
export default function PayDialog({invitationId,beforePay,onClose,product='publish'}:{invitationId:string;beforePay:()=>Promise<void>;onClose:()=>void;product?:'publish'|'keep'}){
  const t=copy[product];
  const [order,setOrder]=useState<Order|null>(null),[error,setError]=useState(''),[ready,setReady]=useState(false),[paying,setPaying]=useState(false);const widgets=useRef<Widgets|null>(null);
  useEffect(()=>{let stop=false;(async()=>{try{await beforePay();const r=await fetch(`/api/invitations/${invitationId}/checkout`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product})});const o=await r.json() as Order&{error?:string};if(!r.ok)throw Error(o.error||'결제를 준비하지 못했어요.');if(stop)return;setOrder(o);const Toss=await loadSdk();const w=Toss(o.clientKey).widgets({customerKey:Toss.ANONYMOUS});await w.setAmount({currency:'KRW',value:o.amount});await Promise.all([w.renderPaymentMethods({selector:'#pay-methods',variantKey:'DEFAULT'}),w.renderAgreement({selector:'#pay-agreement',variantKey:'AGREEMENT'})]);if(stop)return;widgets.current=w;setReady(true)}catch(e){if(!stop)setError(e instanceof Error?e.message:'결제를 준비하지 못했어요.')}})();return()=>{stop=true}},[invitationId,beforePay,product]);
  async function pay(){if(!order||!widgets.current)return;setPaying(true);setError('');try{await widgets.current.requestPayment({orderId:order.orderId,orderName:order.orderName,successUrl:location.origin+'/pay/success',failUrl:location.origin+'/pay/fail'})}catch(e){const m=e as {code?:string;message?:string};if(m.code!=='USER_CANCEL')setError(m.message||'결제를 진행하지 못했어요.')}finally{setPaying(false)}}
  return <div className="modal-backdrop"><section className="link-dialog pay-dialog" role="dialog" aria-modal="true" aria-labelledby="pay-title">
    <button className="text-btn" onClick={onClose}>닫기 ×</button>
    <h2 id="pay-title">{t.title}</h2>
    <p>{t.note}</p>
    <strong className="checkout-price">{(order?.amount||t.price).toLocaleString('ko-KR')}원</strong>
    <p className="pay-terms">{t.terms} <a href="/refund" target="_blank" rel="noreferrer">환불 정책</a></p>
    {order?.mode==='test'&&<p className="pay-test">연습 결제 화면입니다. 실제로 돈이 나가지 않아요.</p>}
    <div id="pay-methods"/><div id="pay-agreement"/>
    {!ready&&!error&&<p className="hint">결제창을 불러오는 중…</p>}
    {error&&<p className="admin-error">{error}</p>}
    <button className="primary" disabled={!ready||paying} onClick={pay}>{paying?'결제 진행 중…':`${(order?.amount||t.price).toLocaleString('ko-KR')}원 ${t.button}`}</button>
  </section></div>;
}
