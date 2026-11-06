'use client';
// 파티 초대장(생일·홈파티·집들이·연말모임): 받은 사람이 이름을 적고 '갈게요 / 못 가요'를 누르면 오는 사람 명단이 바로 보입니다.
import { useEffect,useState } from 'react';
import type { Design } from './model';
import { track } from './track';
type Summary={yes:number;no:number;names:string[]};
export function PartyGoing({d,id,preview}:{d:Design;id?:string;preview:boolean}){
  const key='oi-going-'+(id||'preview');const [name,setName]=useState(''),[sum,setSum]=useState<Summary|null>(null),[mine,setMine]=useState<''|'yes'|'no'>(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{const t=setTimeout(()=>{try{const v=localStorage.getItem(key);if(v==='yes'||v==='no')setMine(v)}catch{}if(preview)setSum({yes:3,no:0,names:['지우','민수','서연']})},0);if(!preview&&id)fetch(`/api/invitations/${id}/going`).then(r=>r.json() as Promise<Summary>).then(j=>{if(Array.isArray(j.names))setSum(j)}).catch(()=>{});return()=>clearTimeout(t)},[id,key,preview]);
  async function answer(attending:boolean){if(!name.trim()){setError('이름을 먼저 적어 주세요.');return}setError('');if(preview||!id){setMine(attending?'yes':'no');return}setBusy(true);try{const r=await fetch(`/api/invitations/${id}/going`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim(),attending})});const j=await r.json() as Summary&{error?:string};if(!r.ok)throw Error(j.error);setSum(j);setMine(attending?'yes':'no');try{localStorage.setItem(key,attending?'yes':'no')}catch{}if(attending)track('party_going')}catch(e){setError(e instanceof Error&&e.message?e.message:'다시 시도해 주세요.')}finally{setBusy(false)}}
  return <section className="party-going" data-pv="going"><small>ARE YOU COMING?</small><h2>오실 수 있나요?</h2>
    {mine?<div className="going-done" role="status"><b>{mine==='yes'?'좋아요, 그날 만나요! 🙌':'아쉽지만 다음에 꼭 봐요'}</b><p className="small">{d.names?`${d.names}에게 `:''}답장이 전해졌어요.</p></div>:<><input className="guest-name" value={name} maxLength={20} placeholder="이름 (예: 김지우)" onChange={e=>setName(e.target.value)}/><div className="going-buttons"><button type="button" className="going-yes" disabled={busy} onClick={()=>answer(true)}>갈게요 🙌</button><button type="button" className="going-no" disabled={busy} onClick={()=>answer(false)}>아쉽지만 못 가요</button></div>{error&&<p className="rsvp-error" role="alert">{error}</p>}</>}
    {sum&&sum.yes>0&&<div className="going-list"><p className="small">지금까지 <b>{sum.yes}명</b>이 온대요</p><div>{sum.names.map((n,i)=><span key={i}>{n}</span>)}</div></div>}
  </section>}
export function PartyCta({preview}:{preview:boolean}){const inner=<>나도 초대장 만들기 →</>;return <section className="couple-cta"><small>MAKE YOURS</small><h2>나도 이런 초대장<br/>만들어 볼까요?</h2><p>생일·홈파티·집들이·연말 모임까지.<br/>가입 없이 3분이면 끝나요.</p>{preview?<span className="invite-button">{inner}</span>:
  // 편집 화면으로 완전히 넘어가야 해서 일반 링크를 씁니다.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  <a className="invite-button" href="/?make=party">{inner}</a>}</section>}
