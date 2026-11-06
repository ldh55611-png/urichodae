import { db,reply,failure,sameOrigin,publishedDesign } from '../../../service';
// 커플청첩장 '결혼 승낙' 버튼. 따로 표를 만들지 않고 참석 응답 표(rsvps)에 side='bless'로 한 줄씩 남깁니다.
// 같은 사람이 여러 번 누르는 것은 화면(브라우저 저장)에서 막고, 초대장 하나당 5000번까지만 받습니다.
const count=async(id:string)=>(await db().prepare("SELECT COUNT(*) n FROM rsvps WHERE invitation=? AND side='bless'").bind(id).first<{n:number}>())?.n||0;
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const d=await publishedDesign(id);if(d.kind!=='couple')throw Error('커플청첩장이 아닙니다.');return reply({count:await count(id)})}catch(e){return failure(e)}}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(req);const {id}=await params;const d=await publishedDesign(id);if(d.kind!=='couple')throw Error('커플청첩장이 아닙니다.');const n=await count(id);if(n>=5000)return reply({count:n});await db().prepare("INSERT INTO rsvps(id,invitation,name,side,attending,count,created) VALUES(?,?,'승낙','bless',1,1,?)").bind(crypto.randomUUID(),id,new Date().toISOString()).run();return reply({count:n+1},201)}catch(e){return failure(e)}}
