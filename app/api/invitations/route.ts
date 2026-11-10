import { db,user,reply,failure,sameOrigin } from '../service';
import { ensureOwner,currentOwner } from '../../guest-session';
import { betaPolicy } from '../../beta-policy';
import { defaults,kstToday,isFreeKind,isBlankDraft } from '../../model';
import { payMode,hostOf } from '../payment';
import { recordVisit } from '../../visit';
export async function GET(){try{const owner=await currentOwner();if(!owner)return reply([]);const rows=await db().prepare('SELECT id,data,published,updated,keep,purged FROM invitations WHERE owner=? ORDER BY updated DESC').bind(owner).all<{id:string;data:string;published:number;updated:string;keep:string;purged:string}>();return reply(rows.results.map(r=>({...r,data:JSON.parse(r.data),published:!!r.published})))}catch(e){return failure(e)}}
export async function POST(req:Request){try{sameOrigin(req);const owner=await ensureOwner(req);const raw=await req.json() as {kind?:string};
  // 개수 제한은 청첩장·돌잔치에만 걸고, 빈 초안은 세지 않습니다. 커플청첩장·파티 초대장은 제한이 없어요.
  if(raw.kind!=='couple'&&raw.kind!=='party'){const rows=await db().prepare('SELECT data,published FROM invitations WHERE owner=?').bind(owner).all<{data:string;published:number}>();const used=rows.results.filter(r=>{let x:{kind?:string}={};try{x=JSON.parse(r.data)}catch{}return !isFreeKind(x.kind)&&!isBlankDraft(x,!!r.published)}).length;if(used>=betaPolicy.maxInvitations)throw Error(`무료 베타 동안 청첩장·돌잔치는 한 사람당 ${betaPolicy.maxInvitations}개까지 만들 수 있어요. 안 쓰는 초안은 '내 초대장'에서 지울 수 있어요.`)}
  const data=defaults(raw.kind==='baby'||raw.kind==='couple'||raw.kind==='party'?raw.kind:'wedding');if(data.kind==='couple')data.couple.made=kstToday();const id=crypto.randomUUID(),updated=new Date().toISOString();await db().prepare('INSERT INTO invitations(id,owner,data,published,updated,created,entitlement) VALUES(?,?,?,0,?,?,?)').bind(id,owner,JSON.stringify(data),updated,updated,payMode(hostOf(req))==='off'?'free_beta':'unpaid').run();await recordVisit('made');return reply({id,data,published:false,updated},201)}catch(e){return failure(e)}}
