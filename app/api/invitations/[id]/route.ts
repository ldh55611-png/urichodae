import { db,bucket,own,reply,failure,sameOrigin,validData } from '../../service';
import { payMode,hostOf,needsPayment } from '../../payment';
import { isFreeKind } from '../../../model';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await params;const row=await own(id) as {data:string;published:number;entitlement?:string};if(Number(req.headers.get('content-length')||0)>200000)throw Error('내용이 너무 깁니다.');const d=await validData(id,await req.json());const updated=new Date().toISOString();// 결제 없이 발행한 커플청첩장을 정식 청첩장으로 바꾸면, 결제가 필요한 동안에는 발행을 내립니다(다시 발행할 때 결제).
  let kind='';try{kind=JSON.parse(row.data).kind}catch{}const unpublish=!!row.published&&isFreeKind(kind)&&!isFreeKind(d.kind)&&needsPayment(payMode(hostOf(req)),row.entitlement||'free_beta',d.kind);await db().prepare('UPDATE invitations SET data=?,updated=?,published=CASE WHEN ?=1 THEN 0 ELSE published END WHERE id=?').bind(JSON.stringify(d),updated,unpublish?1:0,id).run();return reply({ok:true,updated,unpublished:unpublish})}catch(e){return failure(e)}}

// 아직 발행하지 않은 내 초안만 지웁니다. 발행했거나 결제한 초대장은 지울 수 없어요.
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await params;const row=await own(id);if(row.published)throw Error('발행된 초대장은 지울 수 없어요.');const d=db();const paid=await d.prepare("SELECT COUNT(*) AS n FROM payments WHERE invitation=? AND status='done'").bind(id).first<{n:number}>();if(paid?.n)throw Error('결제한 초대장은 지울 수 없어요.');
  const files=await d.prepare('SELECT id FROM assets WHERE invitation=? UNION ALL SELECT id FROM guest_photos WHERE invitation=?').bind(id,id).all<{id:string}>();const keys=files.results.map(f=>f.id);for(let i=0;i<keys.length;i+=1000)await bucket().delete(keys.slice(i,i+1000));
  await d.batch(['assets','guest_photos','rsvps','guestbook','payments'].map(t=>d.prepare(`DELETE FROM ${t} WHERE invitation=?`).bind(id)).concat(d.prepare('DELETE FROM invitations WHERE id=? AND owner=? AND published=0').bind(id,row.owner)));
  return reply({ok:true})}catch(e){return failure(e)}}
