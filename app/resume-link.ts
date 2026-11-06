'use client';
import type { Design } from './model';
import { shareResumeKakao } from './kakao-share';
// 이어서 만들기 링크: 주소에 관리키를 담아 두었다가, 누르면 이 브라우저로 내 초대장을 불러옵니다.
// 관리키와 같은 권한이라 '나에게만' 보내라고 안내합니다.
export const RESUME_PARAM='resume';
export function resumeUrl(key:string){return `${location.origin}/?${RESUME_PARAM}=${encodeURIComponent(key)}`}
export async function sendResumeLink(key:string,d:Design):Promise<'kakao'|'shared'|'copied'>{
  const url=resumeUrl(key);const what=d.kind==='baby'?'돌잔치 초대장':d.kind==='couple'?'커플청첩장':'청첩장';
  const text=`[우리의 초대] 만들던 ${what}을 이어서 만들 수 있는 링크예요.\n이 링크는 다른 사람에게 보내지 마세요. 누구나 수정할 수 있게 돼요.`;
  try{await shareResumeKakao(url,text);return 'kakao'}catch{}
  try{if(navigator.share){await navigator.share({title:'우리의 초대 · 이어서 만들기',text,url});return 'shared'}}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'shared'}
  await navigator.clipboard.writeText(url);return 'copied';
}
// 링크로 들어왔으면 관리키로 내 초대장을 불러오고 주소에서 키를 지웁니다. 불러왔으면 true.
export async function takeResumeLink():Promise<boolean>{
  const q=new URLSearchParams(location.search);const key=q.get(RESUME_PARAM);if(!key)return false;
  q.delete(RESUME_PARAM);history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);
  try{const cur=await fetch('/api/session').then(r=>r.json() as Promise<{key?:string}>).catch(()=>({} as {key?:string}));if(cur.key===key)return true;if(cur.key&&!confirm('이 브라우저에서 만들던 다른 초대장 대신, 링크의 초대장을 불러올까요?'))return false;
    const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});return r.ok}catch{return false}
}
