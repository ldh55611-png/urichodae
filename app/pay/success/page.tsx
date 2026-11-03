import { env } from 'cloudflare:workers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { tossKeys,requireComplete,type PayMode } from '../../api/payment';
import { normalize } from '../../model';
import CopyLink from '../copy-link';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'결제 완료 | 우리의 초대',robots:{index:false,follow:false}};
type Pay={order_id:string;invitation:string;amount:number;mode:PayMode;status:string;product:string};
// 토스페이먼츠 결제창에서 돌아오면 여기서 금액을 확인하고 결제를 승인한 뒤 초대장을 발행합니다.
async function confirm(paymentKey:string,orderId:string,amount:number):Promise<{ok:true;id:string;test:boolean;keep:boolean;both:boolean;draft:boolean}|{ok:false;message:string}>{
  const DB=env.DB;if(!DB)return {ok:false,message:'저장소 연결을 확인해 주세요.'};
  const pay=await DB.prepare('SELECT order_id,invitation,amount,mode,status,product FROM payments WHERE order_id=?').bind(orderId).first<Pay>();
  if(!pay)return {ok:false,message:'주문 정보를 찾을 수 없습니다.'};
  if(pay.amount!==amount)return {ok:false,message:'결제 금액이 맞지 않아 결제를 진행하지 않았습니다.'};
  const test=pay.mode!=='live',keep=pay.product==='keep',both=pay.product==='publish_keep';
  // 내용(이름·날짜·장소·주소·메인 사진)을 다 채운 초대장만 결제와 함께 바로 발행하고, 덜 채운 초대장은 결제만 해 두었다가 다 채운 뒤 발행합니다.
  const inv=await DB.prepare('SELECT data,published FROM invitations WHERE id=?').bind(pay.invitation).first<{data:string;published:number}>();
  let complete=true;try{requireComplete(normalize(JSON.parse(inv?.data||'{}')))}catch{complete=false}
  const pub=complete||!!inv?.published?1:0,draft=!keep&&!pub;
  if(pay.status==='done')return {ok:true,id:pay.invitation,test,keep,both,draft};
  const {secret}=tossKeys(pay.mode);
  const res=await fetch('https://api.tosspayments.com/v1/payments/confirm',{method:'POST',headers:{Authorization:'Basic '+btoa(secret+':'),'Content-Type':'application/json','Idempotency-Key':orderId},body:JSON.stringify({paymentKey,orderId,amount})});
  const json=await res.json().catch(()=>({})) as {method?:string;message?:string;approvedAt?:string};
  if(!res.ok){await DB.prepare("UPDATE payments SET status='failed' WHERE order_id=? AND status='ready'").bind(orderId).run();return {ok:false,message:json.message||'결제 승인에 실패했습니다.'}}
  const now=new Date().toISOString();
  await DB.batch([
    DB.prepare("UPDATE payments SET status='done',payment_key=?,method=?,approved=? WHERE order_id=?").bind(paymentKey,json.method||'',json.approvedAt||now,orderId),
    // 영구보관 결제는 보관 상태만 바꾸고, 발행 결제는 결제 완료 표시와 함께 발행합니다.
    keep?DB.prepare('UPDATE invitations SET keep=?,published=1,updated=? WHERE id=?').bind(test?'test_forever':'forever',now,pay.invitation)
        :both?DB.prepare('UPDATE invitations SET entitlement=?,keep=?,published=?,updated=? WHERE id=?').bind(test?'test_paid':'paid',test?'test_forever':'forever',pub,now,pay.invitation)
        :DB.prepare('UPDATE invitations SET entitlement=?,published=?,updated=? WHERE id=?').bind(test?'test_paid':'paid',pub,now,pay.invitation)]);
  return {ok:true,id:pay.invitation,test,keep,both,draft};
}
export default async function PaySuccess({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const q=await searchParams;const h=await headers();const origin=`${h.get('x-forwarded-proto')||'https'}://${h.get('host')||'urichodae.com'}`;const amount=Number(q.amount);
  const result=q.paymentKey&&q.orderId&&Number.isFinite(amount)?await confirm(q.paymentKey,q.orderId,amount):{ok:false as const,message:'결제 정보가 없습니다.'};
  return <main className="pay-result">{result.ok?<>
    <span className="success-icon">✓</span><h1>결제가 끝났어요</h1>{result.draft?<p>결제가 완료됐어요.<br/>편집 화면에서 이름·날짜·장소·주소·메인 사진을 채운 뒤 ‘발행하기’를 누르면<br/>추가 결제 없이 바로 공개돼요.</p>:result.keep?<p>영구보관이 시작됐어요.<br/>이제 기간 없이 언제든 다시 볼 수 있어요.</p>:<p>초대장이 발행되었습니다.{result.both&&<> 영구보관도 함께 적용됐어요.</>}<br/>아래 주소를 카카오톡이나 문자로 보내 주세요.</p>}
    {result.test&&<p className="pay-test">연습 결제입니다. 실제로 돈이 나가지 않았어요.</p>}
    {result.draft?<Link className="primary" href="/">편집 화면으로 돌아가기</Link>:<>
    <CopyLink url={origin+'/i/'+result.id}/>
    <a className="primary" href={'/i/'+result.id} target="_blank" rel="noreferrer">발행된 초대장 보기</a>
    <Link className="text-btn" href="/">편집 화면으로 돌아가기</Link></>}
  </>:<>
    <h1>결제를 마치지 못했어요</h1><p>{result.message}</p><p className="hint">돈이 빠져나갔는데 이 화면이 보이면 고객센터로 알려 주세요.</p><Link className="primary" href="/">편집 화면으로 돌아가기</Link>
  </>}</main>;
}
