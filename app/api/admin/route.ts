import { env } from 'cloudflare:workers';
import { db,reply,sameOrigin } from '../service';
// 대표 전용 관리자 화면용 통계. 비밀번호는 Cloudflare 워커 설정의 비밀 값 ADMIN_PASSWORD 로만 확인합니다.
const digest=async(v:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
async function same(a:string,b:string){const x=await digest(a),y=await digest(b);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0}
const kstDay=(iso:string)=>{const t=new Date(iso);return isNaN(+t)?'':new Date(+t+9*3600e3).toISOString().slice(0,10)};
type Row={id:string;owner:string;data:string;published:number;updated:string;created:string;maker_since:string|null;rsvps:number;guestbook:number;photos:number;bytes:number};
export async function POST(req:Request){
  try{sameOrigin(req)}catch{return reply({error:'허용되지 않은 요청입니다.'},403)}
  const secret=env.ADMIN_PASSWORD;
  if(!secret)return reply({error:'관리자 비밀번호가 아직 설정되지 않았습니다.',setup:true},503);
  const raw=await req.json().catch(()=>({})) as {password?:unknown};
  if(typeof raw.password!=='string'||raw.password.length>200||!await same(raw.password,secret)){await new Promise(r=>setTimeout(r,800));return reply({error:'비밀번호가 맞지 않습니다.'},401)}
  const d=db();
  const rows=await d.prepare(`SELECT i.id,i.owner,i.data,i.published,i.updated,i.created,g.created AS maker_since,
    (SELECT COUNT(*) FROM rsvps r WHERE r.invitation=i.id) AS rsvps,
    (SELECT COUNT(*) FROM guestbook b WHERE b.invitation=i.id) AS guestbook,
    (SELECT COUNT(*) FROM guest_photos p WHERE p.invitation=i.id) AS photos,
    (SELECT COALESCE(SUM(size),0) FROM assets a WHERE a.invitation=i.id)+(SELECT COALESCE(SUM(size),0) FROM guest_photos p WHERE p.invitation=i.id) AS bytes
    FROM invitations i LEFT JOIN guest_sessions g ON g.owner=i.owner ORDER BY COALESCE(NULLIF(i.created,''),i.updated) DESC LIMIT 1000`).all<Row>();
  const makers=await d.prepare('SELECT created FROM guest_sessions').all<{created:string}>();
  const files=await d.prepare('SELECT (SELECT COALESCE(SUM(size),0) FROM assets)+(SELECT COALESCE(SUM(size),0) FROM guest_photos) AS bytes').first<{bytes:number}>();
  const today=kstDay(new Date().toISOString());
  const list=rows.results.map(r=>{let x:{kind?:string;names?:string;title?:string;date?:string;place?:string;hall?:string}={};try{x=JSON.parse(r.data)}catch{}
    const created=r.created||'';
    return {id:r.id,maker:r.owner.replace(/^guest:/,'').slice(0,6),kind:x.kind==='baby'?'baby':'wedding',names:x.names||'',title:x.title||'',date:x.date||'',place:[x.place,x.hall].filter(Boolean).join(' '),published:!!r.published,created,updated:r.updated,makerSince:r.maker_since||'',rsvps:r.rsvps,guestbook:r.guestbook,photos:r.photos,bytes:r.bytes}});
  const createdDay=(i:typeof list[number])=>kstDay(i.created);
  return reply({today,
    totals:{invitations:list.length,published:list.filter(i=>i.published).length,todayInvitations:list.filter(i=>createdDay(i)===today).length,todayPublished:list.filter(i=>i.published&&kstDay(i.updated)===today).length,makers:makers.results.length,todayMakers:makers.results.filter(m=>kstDay(m.created)===today).length,rsvps:list.reduce((s,i)=>s+i.rsvps,0),guestbook:list.reduce((s,i)=>s+i.guestbook,0)},
    storage:{fileBytes:files?.bytes||0,fileLimit:10*1024**3,dbBytes:(rows.meta as {size_after?:number})?.size_after||0,dbLimit:5*1024**3},
    list});
}
