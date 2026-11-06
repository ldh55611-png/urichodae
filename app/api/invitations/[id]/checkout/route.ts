import { db,own,reply,failure,sameOrigin,validData } from '../../../service';
import { payMode,hostOf,tossKeys,price,needsPayment } from '../../../payment';
import { productName,keepPrice,keepProductName,keepOpen } from '../../../../payment-config';
import { normalize } from '../../../../model';
import { retentionOf } from '../../../../retention';
// 결제창을 열기 전에 주문번호를 만들어 둡니다. 결제 금액은 서버가 정하고, 승인할 때 다시 확인합니다.
// product: 'publish'(발행 결제, 기본) 또는 'keep'(영구보관 연장). 발행 결제에 withKeep:true면 영구보관까지 한 번에 결제('publish_keep').
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await params;const row=await own(id) as {owner:string;data:string;published:number;entitlement?:string;keep?:string;purged?:string};const mode=payMode(hostOf(req));
  const body=await req.json().catch(()=>({})) as {product?:string;withKeep?:boolean};const product=body.product==='keep'?'keep':body.withKeep&&mode!=='off'?'publish_keep':'publish';if(!keepOpen&&product!=='publish')throw Error('영구보관은 지금 신청할 수 없어요.');
  let amount=price,orderName=productName;
  if(product==='keep'){
    if(mode==='off')throw Error('영구보관은 곧 열려요. 조금만 기다려 주세요.');
    const r=retentionOf(normalize(JSON.parse(row.data)),row.keep,row.purged);
    if(r.kept)throw Error('이미 영구보관 중인 초대장입니다.');
    if(r.purged)throw Error('사진 보관 기간이 지나 영구보관을 할 수 없습니다.');
    if(!row.published)throw Error('발행한 초대장만 영구보관할 수 있어요.');
    amount=keepPrice;orderName=keepProductName;
  }else{
    if(!needsPayment(mode,row.entitlement||'free_beta',normalize(JSON.parse(row.data)).kind))throw Error('이미 결제가 끝났거나 결제가 필요 없는 초대장입니다.');
    await validData(id,JSON.parse(row.data));
    // 토스페이먼츠 기준(서비스 제공기간 최대 12개월): 예식일이 결제일로부터 11개월(335일) 안이어야 발행 결제를 받습니다.
    {const when=Date.parse(normalize(JSON.parse(row.data)).date);if(Number.isFinite(when)&&when-Date.now()>335*86400e3)throw Error('예식일(행사일)이 오늘부터 11개월 이내일 때 발행할 수 있어요.')}
    if(product==='publish_keep'){amount=price+keepPrice;orderName=productName+' + 영구보관'}
  }
  const orderId=(product==='keep'?'ok-':product==='publish_keep'?'ob-':'oi-')+crypto.randomUUID().replaceAll('-','').slice(0,24);
  await db().prepare('INSERT INTO payments(order_id,invitation,owner,amount,mode,status,created,product) VALUES(?,?,?,?,?,?,?,?)').bind(orderId,id,row.owner,amount,mode,'ready',new Date().toISOString(),product).run();
  return reply({orderId,amount,orderName,clientKey:tossKeys(mode).client,mode,product})}catch(e){return failure(e)}}
