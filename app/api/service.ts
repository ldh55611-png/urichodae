import { env } from 'cloudflare:workers';
import { currentOwner } from '../guest-session';
import { schema,tiers,usedAssets } from '../model';
export const db=()=>{if(!env.DB)throw Error('저장소 연결을 확인해 주세요.');return env.DB};
export const bucket=()=>{if(!env.BUCKET)throw Error('파일 저장소를 연결해 주세요.');return env.BUCKET};
export function reply(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function user(){const owner=await currentOwner();if(!owner)throw Error('관리키로 복구하거나 새 초대장을 만들어 주세요.');return owner}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw Error('허용되지 않은 요청입니다.')}
export async function own(id:string){const owner=await user();const row=await db().prepare('SELECT * FROM invitations WHERE id=? AND owner=?').bind(id,owner).first<{id:string;owner:string;data:string;published:number;updated:string}>();if(!row)throw Error('초대장을 찾을 수 없습니다.');return row}
export async function validData(id:string,raw:unknown){const d=schema.parse(raw),limit=tiers[d.tier];if(d.hero.length>limit.main||d.gallery.length>limit.gallery)throw Error('등급별 사진 수를 확인해 주세요.');if(d.tier==='standard'&&(d.music||d.video))throw Error('음악은 디럭스부터 사용할 수 있습니다.');if(d.tier!=='premium'&&d.video)throw Error('영상은 럭셔리에서 사용할 수 있습니다.');for(const key of new Set(usedAssets(d))){const a=await db().prepare('SELECT kind FROM assets WHERE id=? AND invitation=?').bind(key,id).first<{kind:string}>();if(!a)throw Error('초대장에 속하지 않은 파일입니다.');if(a.kind!==(d.music===key?'music':d.video===key?'video':'image'))throw Error('파일 종류가 맞지 않습니다.')}return d}
export function failure(e:unknown){const message=e instanceof Error?e.message:'처리하지 못했습니다.';return reply({error:message.length>300?'입력 내용을 확인해 주세요.':message},message.includes('관리키로 복구')?401:400)}
