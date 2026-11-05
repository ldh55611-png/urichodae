import { env } from 'cloudflare:workers';
import { db,bucket,reply,sameOrigin } from '../service';
// 대표 전용 관리자 화면용 통계. 비밀번호는 Cloudflare 워커 설정의 비밀 값 ADMIN_PASSWORD 로만 확인합니다.
const digest=async(v:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
async function same(a:string,b:string){const x=await digest(a),y=await digest(b);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0}
const kstDay=(iso:string)=>{const t=new Date(iso);return isNaN(+t)?'':new Date(+t+9*3600e3).toISOString().slice(0,10)};
type Row={id:string;owner:string;data:string;published:number;published_at:string;updated:string;created:string;maker_since:string|null;rsvps:number;guestbook:number;photos:number;bytes:number};
export async function POST(req:Request){
  try{sameOrigin(req)}catch{return reply({error:'허용되지 않은 요청입니다.'},403)}
  const secret=env.ADMIN_PASSWORD;
  if(!secret)return reply({error:'관리자 비밀번호가 아직 설정되지 않았습니다.',setup:true},503);
  const raw=await req.json().catch(()=>({})) as {password?:unknown;action?:unknown;ids?:unknown};
  if(typeof raw.password!=='string'||raw.password.length>200||!await same(raw.password,secret)){await new Promise(r=>setTimeout(r,800));return reply({error:'비밀번호가 맞지 않습니다.'},401)}
  const d=db();
  if(raw.action==='delete'){
    const ids=Array.isArray(raw.ids)?raw.ids.filter((x):x is string=>typeof x==='string'&&/^[0-9a-f-]{36}$/.test(x)).slice(0,500):[];
    if(!ids.length)return reply({error:'지울 초대장을 골라 주세요.'},400);
    const removed=await removeInvitations(ids);
    return reply({deleted:removed});
  }
  const rows=await d.prepare(`SELECT i.id,i.owner,i.data,i.published,i.published_at,i.updated,i.created,g.created AS maker_since,
    (SELECT COUNT(*) FROM rsvps r WHERE r.invitation=i.id) AS rsvps,
    (SELECT COUNT(*) FROM guestbook b WHERE b.invitation=i.id) AS guestbook,
    (SELECT COUNT(*) FROM guest_photos p WHERE p.invitation=i.id) AS photos,
    (SELECT COALESCE(SUM(size),0) FROM assets a WHERE a.invitation=i.id)+(SELECT COALESCE(SUM(size),0) FROM guest_photos p WHERE p.invitation=i.id) AS bytes
    FROM invitations i LEFT JOIN guest_sessions g ON g.owner=i.owner ORDER BY COALESCE(NULLIF(i.created,''),i.updated) DESC LIMIT 1000`).all<Row>();
  const makers=await d.prepare('SELECT created FROM guest_sessions').all<{created:string}>();
  const files=await d.prepare('SELECT (SELECT COALESCE(SUM(size),0) FROM assets)+(SELECT COALESCE(SUM(size),0) FROM guest_photos) AS bytes').first<{bytes:number}>();
  const today=kstDay(new Date().toISOString());
  // 결제: 승인 완료된 것만. 실제 결제(live)와 연습 결제(test)를 따로 셉니다. 승인 시각을 한국 날짜로 바꿔 오늘 것을 고릅니다.
  const pays=await d.prepare("SELECT amount,mode,approved,created FROM payments WHERE status='done'").all<{amount:number;mode:string;approved:string;created:string}>();
  const payDay=(p:{approved:string;created:string})=>kstDay(p.approved||p.created);
  const sum=(xs:{amount:number}[])=>xs.reduce((a,x)=>a+x.amount,0);
  const live=pays.results.filter(p=>p.mode==='live'),test=pays.results.filter(p=>p.mode!=='live');
  const sales={todayAmount:sum(live.filter(p=>payDay(p)===today)),todayCount:live.filter(p=>payDay(p)===today).length,totalAmount:sum(live),totalCount:live.length,testTodayAmount:sum(test.filter(p=>payDay(p)===today)),testTodayCount:test.filter(p=>payDay(p)===today).length};
  // 방문자: 최근 7일, 메인 화면 / 청첩장 화면별 사람 수와 열람 수
  const since=kstDay(new Date(Date.now()-6*86400e3).toISOString());
  const vrows=await d.prepare('SELECT day,kind,COUNT(*) AS people,SUM(views) AS views FROM visits WHERE day>=? GROUP BY day,kind').bind(since).all<{day:string;kind:string;people:number;views:number}>();
  const days=Array.from({length:7},(_,i)=>kstDay(new Date(Date.now()-(6-i)*86400e3).toISOString()));
  const list=rows.results.map(r=>{let x:{kind?:string;names?:string;title?:string;date?:string;place?:string;hall?:string;address?:string;hero?:unknown[]}={};try{x=JSON.parse(r.data)}catch{}
    const created=r.created||'';
    return {id:r.id,maker:r.owner.replace(/^guest:/,'').slice(0,6),kind:x.kind==='baby'?'baby':'wedding',names:x.names||'',title:x.title||'',date:x.date||'',place:[x.place,x.hall].filter(Boolean).join(' '),published:!!r.published,steps:{names:!!x.names?.trim(),date:!!x.date&&Number.isFinite(Date.parse(x.date)),place:!!x.place?.trim()&&!!x.address?.trim(),hero:Array.isArray(x.hero)&&x.hero.length>0},publishedAt:r.published_at||'',created,updated:r.updated,makerSince:r.maker_since||'',rsvps:r.rsvps,guestbook:r.guestbook,photos:r.photos,bytes:r.bytes}});
  const createdDay=(i:typeof list[number])=>kstDay(i.created);
  // 메인 화면 행동(사람 수): 만들기 누름, 안내창에서 바로 만들기, 안내창 닫고 둘러봄, 샘플 봄, 영상 봄 + 실제로 만들어진 초대장 수
  const people=(day:string,kind:string)=>vrows.results.find(r=>r.day===day&&r.kind===kind)?.people||0;
  const visits=days.map(day=>{const h=vrows.results.find(r=>r.day===day&&r.kind==='home'),v=vrows.results.find(r=>r.day===day&&r.kind==='invite');return {day,home:h?.people||0,invite:v?.people||0,views:(h?.views||0)+(v?.views||0),start:people(day,'start'),noticeStart:people(day,'notice_start'),noticeBrowse:people(day,'notice_browse'),sample:people(day,'sample'),video:people(day,'video'),made:Math.max(people(day,'made'),list.filter(i=>createdDay(i)===day).length),makeFail:people(day,'make_fail')}});
  // 만든 초대장이 어디까지 채워졌나(저장된 내용으로 계산): 최근 7일에 만든 것 / 전체
  const stepOf=(xs:typeof list)=>{const all=(i:typeof list[number])=>i.steps.names&&i.steps.date&&i.steps.place&&i.steps.hero;return {made:xs.length,names:xs.filter(i=>i.steps.names).length,date:xs.filter(i=>i.steps.date).length,place:xs.filter(i=>i.steps.place).length,hero:xs.filter(i=>i.steps.hero).length,complete:xs.filter(all).length,published:xs.filter(i=>i.published).length}};
  const recent=list.filter(i=>createdDay(i)>=since);
  const act=(kind:string)=>vrows.results.filter(r=>r.kind===kind).reduce((a,r)=>a+r.people,0);
  const funnel={recent:stepOf(recent),all:stepOf(list),actions:{publishClick:act('publish_click'),publishMissing:act('publish_missing'),resumeSend:act('resume_send'),resumeBack:act('resume_back')}};
  return reply({today,sales,visits,funnel,
    totals:{invitations:list.length,published:list.filter(i=>i.published).length,todayInvitations:list.filter(i=>createdDay(i)===today).length,// 오늘 발행: 처음 발행한 날이 오늘인 초대장(이미 발행된 초대장을 오늘 고친 것은 세지 않음)
    todayPublished:list.filter(i=>i.published&&kstDay(i.publishedAt)===today).length,makers:makers.results.length,todayMakers:makers.results.filter(m=>kstDay(m.created)===today).length,rsvps:list.reduce((s,i)=>s+i.rsvps,0),guestbook:list.reduce((s,i)=>s+i.guestbook,0)},
    storage:{fileBytes:files?.bytes||0,fileLimit:10*1024**3,dbBytes:(rows.meta as {size_after?:number})?.size_after||0,dbLimit:5*1024**3},
    list});
}

// 초대장과 딸린 기록(사진·음악·영상 파일, 참석 응답, 방명록, 하객 사진, 결제 기록)을 모두 지웁니다. 되돌릴 수 없습니다.
async function removeInvitations(ids:string[]){
  const d=db();let count=0;
  for(const id of ids){
    const files=await d.prepare('SELECT id FROM assets WHERE invitation=? UNION ALL SELECT id FROM guest_photos WHERE invitation=?').bind(id,id).all<{id:string}>();
    const keys=files.results.map(f=>f.id);
    for(let i=0;i<keys.length;i+=1000)await bucket().delete(keys.slice(i,i+1000));
    const res=await d.batch(['assets','guest_photos','rsvps','guestbook','payments'].map(t=>d.prepare(`DELETE FROM ${t} WHERE invitation=?${t==='payments'?" AND NOT (status='done' AND mode='live')":''}`).bind(id)).concat(d.prepare('DELETE FROM invitations WHERE id=?').bind(id)));
    count+=res[res.length-1].meta.changes||0;
  }
  // 초대장이 하나도 남지 않은 제작자 기록도 정리합니다(전체 제작자 숫자에서 빠지도록).
  await d.prepare('DELETE FROM guest_sessions WHERE owner NOT IN (SELECT owner FROM invitations)').run();
  return count;
}
