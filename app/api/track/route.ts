import { recordVisit } from '../../visit';
import { ACTIONS,type Action } from '../../track-actions';
import { reply,sameOrigin } from '../service';
// 메인 화면에서 누른 버튼(만들기·샘플·영상·안내창)을 셉니다. 정해진 이름만 받습니다.
export async function POST(req:Request){try{sameOrigin(req);const raw=await req.json().catch(()=>({})) as {e?:unknown};if(typeof raw.e==='string'&&(ACTIONS as readonly string[]).includes(raw.e))await recordVisit(raw.e as Action);return reply({ok:true})}catch{return reply({ok:false},400)}}
