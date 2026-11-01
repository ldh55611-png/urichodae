import { db,own,reply,failure,sameOrigin,validData } from '../../../service';
import { payMode,hostOf,tossKeys,price,needsPayment,requireComplete } from '../../../payment';
import { productName,keepPrice,keepProductName } from '../../../../payment-config';
import { normalize } from '../../../../model';
import { retention } from '../../../../retention';
// 결제창을 열기 전에 주문번호를 만들어 둡니다. 결제 금액은 서버가 정하고, 승인할 때 다시 확인합니다.
// product: 'publish'(발행 결제, 기본) 또는 'keep'(영구보관 연장)
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await params;const row=await own(id) as {owner:string;data:string;published:number;entitlement?:string;keep?:string;purged?:string};const mode=payMode(hostOf(req));
  const body=await req.json().catch(()=>({})) as {product?:string};const product=body.product==='keep'?'keep':'publish';
  let amount=price,orderName=productName;
  if(product==='keep'){
    if(mode==='off')throw Error('영구보관은 곧 열려요. 조금만 기다려 주세요.');
    const r=retention(normalize(JSON.parse(row.data)).date,row.keep,row.purged);
    if(r.kept)throw Error('이미 영구보관 중인 초대장입니다.');
    if(r.purged)throw Error('사진 보관 기간이 지나 영구보관을 할 수 없습니다.');
    if(!row.published)throw Error('발행한 초대장만 영구보관할 수 있어요.');
    amount=keepPrice;orderName=keepProductName;
  }else{
    if(!needsPayment(mode,row.entitlement||'free_beta'))throw Error('이미 결제가 끝났거나 결제가 필요 없는 초대장입니다.');
    requireComplete(await validData(id,JSON.parse(row.data)));
  }
  const orderId=(product==='keep'?'ok-':'oi-')+crypto.randomUUID().replaceAll('-','').slice(0,24);
  await db().prepare('INSERT INTO payments(order_id,invitation,owner,amount,mode,status,created,product) VALUES(?,?,?,?,?,?,?,?)').bind(orderId,id,row.owner,amount,mode,'ready',new Date().toISOString(),product).run();
  return reply({orderId,amount,orderName,clientKey:tossKeys(mode).client,mode,product})}catch(e){return failure(e)}}
