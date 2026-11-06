// 매일 새벽 3시(한국 시간)에 자동으로 실행되는 정리 작업입니다.
// 열람 기간이 끝나고 7일이 지난 초대장의 사진·음악·영상 파일과 하객이 올린 사진을 지웁니다.
// - 영구보관한 초대장은 초대장 파일을 지우지 않습니다(하객이 올린 사진만 지움).
// - 글(초대장 내용·방명록·참석 여부)은 용량이 아주 작아 남겨 둡니다. 그래서 주소로 들어오면 "기간이 끝난 초대장" 안내가 보입니다.
import { normalize } from '../app/model';
import { retention,viewDate } from '../app/retention';
type Row={id:string;data:string;keep:string;purged:string};
export async function cleanupExpired(env:{DB?:D1Database;BUCKET?:R2Bucket},now=Date.now()){
  const DB=env.DB,BUCKET=env.BUCKET;if(!DB||!BUCKET)return {invitations:0,files:0,bytes:0};
  const rows=await DB.prepare("SELECT id,data,keep,purged FROM invitations").all<Row>();
  let invitations=0,files=0,bytes=0;
  for(const row of rows.results){
    let date='';try{date=viewDate(normalize(JSON.parse(row.data)))}catch{continue}
    const r=retention(date,row.keep,row.purged,now);
    if(r.purgeAt===null||now<r.purgeAt)continue;
    // 하객이 올린 사진: 영구보관 여부와 관계없이 지웁니다.
    const guest=await DB.prepare('SELECT id,size FROM guest_photos WHERE invitation=?').bind(row.id).all<{id:string;size:number}>();
    // 초대장 파일: 영구보관이 아니면 지웁니다.
    const own=r.kept||r.purged?{results:[] as {id:string;size:number}[]}:await DB.prepare('SELECT id,size FROM assets WHERE invitation=?').bind(row.id).all<{id:string;size:number}>();
    if(!guest.results.length&&!own.results.length&&(r.kept||r.purged))continue;
    const keys=[...guest.results,...own.results];
    for(let i=0;i<keys.length;i+=500)await BUCKET.delete(keys.slice(i,i+500).map(k=>k.id));
    const stmts=[DB.prepare('DELETE FROM guest_photos WHERE invitation=?').bind(row.id)];
    if(!r.kept)stmts.push(DB.prepare('DELETE FROM assets WHERE invitation=?').bind(row.id),DB.prepare('UPDATE invitations SET purged=? WHERE id=?').bind(new Date(now).toISOString(),row.id));
    await DB.batch(stmts);
    invitations++;files+=keys.length;bytes+=keys.reduce((s,k)=>s+k.size,0);
  }
  console.log(`[정리] 초대장 ${invitations}개, 파일 ${files}개, ${(bytes/1024/1024).toFixed(1)}MB 삭제`);
  return {invitations,files,bytes};
}
