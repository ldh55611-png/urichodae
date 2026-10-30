import { guest,currentOwner,recover } from '../../guest-session';
import { reply,sameOrigin,failure } from '../service';
export async function GET(){try{const g=await guest();return reply({key:g?.key||null,account:!g&&!!await currentOwner()})}catch(e){return failure(e)}}
export async function POST(req:Request){try{sameOrigin(req);const raw=await req.json() as {key?:unknown};if(typeof raw.key!=='string'||raw.key.length>128)throw Error('관리키를 확인해 주세요.');await recover(raw.key.trim(),req);return reply({ok:true})}catch(e){return failure(e)}}
