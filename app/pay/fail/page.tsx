import type { Metadata } from 'next';
import Link from 'next/link';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'결제 취소 | 우리의 초대',robots:{index:false,follow:false}};
export default async function PayFail({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){const q=await searchParams;const canceled=q.code==='PAY_PROCESS_CANCELED'||q.code==='USER_CANCEL';
  return <main className="pay-result"><h1>{canceled?'결제를 취소했어요':'결제가 되지 않았어요'}</h1><p>{canceled?'돈은 나가지 않았어요. 언제든 다시 발행할 수 있어요.':(q.message||'잠시 뒤 다시 시도해 주세요.').slice(0,200)}</p><Link className="primary" href="/">편집 화면으로 돌아가기</Link></main>}
