'use client';
// 커플청첩장: 결혼 전 커플이 재미로 만들어 애인·친구에게 보내는 가상 청첩장.
// 화면 순서: 표지(이름·D+) → 사진 → 한마디 → 커플 서약서(조항·두 사람 서명) → 결혼 승낙/거절 → 방명록 → '우리도 만들기'
import { useEffect,useState } from 'react';
import type { Design } from './model';
import { dPlus,sinceLabel,coupleNames } from './couple-text';
import { findFont,fontHref } from './design-options';
import { track } from './track';
const pen=findFont('nanum-pen')!;
const article=['제1조','제2조','제3조','제4조','제5조','제6조','제7조','제8조','제9조','제10조'];
function signers(names:string){const parts=names.split(/\s*[·&,/♥]\s*|\s+그리고\s+/).filter(Boolean);return [parts[0]||'',parts[1]||'']}
function writtenOn(made:string){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(made||'')||/^(\d{4})-(\d{2})-(\d{2})/.exec(new Date(Date.now()+9*3600e3).toISOString());return m?`${m[1]}년 ${+m[2]}월 ${+m[3]}일`:''}
const NO=['거절','진짜요?','다시 생각해 봐요','거절 버튼은 고장났어요'];
function Blessing({d,id,preview}:{d:Design;id?:string;preview:boolean}){
  const key='oi-bless-'+(id||'preview');const [done,setDone]=useState(false),[count,setCount]=useState<number|null>(null),[tries,setTries]=useState(0),[pos,setPos]=useState({x:0,y:0}),[burst,setBurst]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>{try{if(localStorage.getItem(key))setDone(true)}catch{}},0);if(preview||!id)return()=>clearTimeout(t);fetch(`/api/invitations/${id}/bless`).then(r=>r.json() as Promise<{count?:number}>).then(j=>{if(typeof j.count==='number')setCount(j.count)}).catch(()=>{});return()=>clearTimeout(t)},[id,key,preview]);
  async function yes(){setBurst(b=>b+1);if(done)return;setDone(true);try{localStorage.setItem(key,'1')}catch{}if(preview||!id){setCount(c=>(c||0)+1);return}track('couple_yes');try{const r=await fetch(`/api/invitations/${id}/bless`,{method:'POST'});const j=await r.json() as {count?:number};if(typeof j.count==='number')setCount(j.count)}catch{}}
  // 거절 버튼은 누르려고 하면 도망가고, 세 번 도망가면 승낙 버튼으로 바뀝니다.
  function dodge(){if(tries>=NO.length-1)return;setTries(t=>t+1);setPos(p=>({x:p.x>30?10+Math.random()*15:45+Math.random()*25,y:(Math.random()<.5?-1:1)*(28+Math.random()*18)}))}
  const [a,b]=signers(d.names);
  return <section className="couple-bless" data-pv="bless"><small>YOUR BLESSING</small><h2>{a&&b?<>{a} ♥ {b}의 결혼을<br/>승낙하시겠어요?</>:<>두 사람의 결혼을<br/>승낙하시겠어요?</>}</h2>
    {done?<div className="bless-done" role="status"><b>승낙 완료!</b><p>이 화면을 캡처해서<br/>두 사람에게 보내 주세요 💌</p></div>:<p className="small">두 사람이 두근두근 기다리고 있어요.</p>}
    <div className="bless-buttons"><button type="button" className="bless-yes" onClick={yes}>{done?'한 번 더 축하하기 ♥':'승낙합니다 ♥'}</button>{!done&&(tries>=NO.length-1?<button type="button" className="bless-no gave-up" onClick={yes}>{NO[NO.length-1]} · 승낙할게요</button>:<button type="button" className="bless-no" style={{transform:`translate(${pos.x}px,${pos.y}px)`}} onPointerEnter={e=>{if(e.pointerType==='mouse')dodge()}} onPointerDown={e=>{e.preventDefault();dodge()}} onClick={e=>{if(e.detail===0)dodge()}}>{NO[tries]}</button>)}</div>
    {count!==null&&count>0&&<p className="bless-count">지금까지 <b>{count.toLocaleString('ko-KR')}명</b>이 승낙했어요</p>}
    {burst>0&&<div className="bless-hearts" key={burst} aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{left:`${5+i*6.7}%`,animationDelay:`${(i%5)*.08}s`}}>♥</i>)}</div>}
  </section>}
export function CoupleBody({d,id,preview,hero}:{d:Design;id?:string;preview:boolean;hero:React.ReactNode}){
  const [now,setNow]=useState<number|null>(null);useEffect(()=>{const t=setTimeout(()=>setNow(Date.now()),0);return()=>clearTimeout(t)},[]);const n=now===null?null:dPlus(d.couple.since,now);const [a,b]=signers(d.names);const pledges=d.couple.pledges.filter(p=>p.trim());
  return <>
    <link rel="stylesheet" href={fontHref([pen])}/>
    <header data-pv="top" className="couple-top"><small>NOT MARRIED YET · BUT</small><h1>{d.title}</h1><p className="couple-names">{d.names?coupleNames(d.names):'너 ♥ 나'}</p>{n?<div className="couple-dday" data-pv="since"><b>D+{n.toLocaleString('ko-KR')}</b><span>{sinceLabel(d.couple.since)}부터 사랑하는 중</span></div>:<div className="couple-dday" data-pv="since"><span>사귄 날을 넣으면 D+day가 보여요</span></div>}</header>
    {(preview||d.hero.length>0)&&<div data-pv="hero">{hero}</div>}
    {d.message.trim()&&<section data-pv="message"><small>FROM US</small><h2>우리 이야기 들어 볼래요?</h2><p>{d.message}</p></section>}
    {(pledges.length>0||preview)&&<section className="couple-pledge" data-pv="pledges"><small>OUR PROMISE</small><h2>커플 서약서</h2><div className="pledge-paper"><p className="pledge-lead">우리 두 사람은 아래 조항을<br/>성실히 지킬 것을 서약합니다.</p>{pledges.length?<ol>{pledges.map((p,i)=><li key={i}><span>{article[i]}</span>{p}</li>)}</ol>:<p className="small">서약 조항을 적으면 이곳에 보여요.</p>}<p className="pledge-date">{writtenOn(d.couple.made)}</p><div className="signatures">{[a,b].map((who,i)=><div key={i}><small>{i===0?'서약인 1':'서약인 2'}</small><b style={{fontFamily:`'${pen.family}', cursive`}}>{who||'이름'}</b><i aria-hidden="true">(서명)</i></div>)}<span className="pledge-stamp" aria-hidden="true">약속<br/>완료</span></div></div></section>}
    <Blessing d={d} id={id} preview={preview}/>
  </>}
// 초대장 맨 아래: 받은 사람이 자기 커플청첩장을 만들러 오게 하는 버튼
export function CoupleCta({preview}:{preview:boolean}){const inner=<>우리도 만들기 →</>;return <section className="couple-cta"><small>MAKE YOURS</small><h2>우리도 커플청첩장<br/>만들어 볼까요?</h2><p>가입 없이 3분이면 끝나요.<br/>서약서·서명·D+day까지 자동으로.</p>{preview?<span className="invite-button">{inner}</span>:// 다른 화면(편집기)으로 완전히 넘어가야 해서 일반 링크를 씁니다.
// eslint-disable-next-line @next/next/no-html-link-for-pages
<a className="invite-button" href="/?make=couple">{inner}</a>}<p className="small">진짜 결혼할 땐, 이 청첩장 그대로<br/>정식 청첩장으로 바꿔 쓸 수 있어요.</p></section>}
