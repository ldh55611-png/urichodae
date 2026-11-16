'use client';
import {useEffect,useRef,useState} from 'react';
import {track} from './track';
import {welcomeStyle} from './welcome-config';
import {siteMode,proposedPrice} from './payment-config';
const paid=siteMode!=='off';
// 처음 온 사람에게만 한 번 보여주는 짧은 환영 창. 휴대폰 첫 화면 안에 버튼까지 다 보이게 짧게 유지합니다.
// 모양은 welcome-config.ts 한 줄로 고릅니다(showcase=4종류 고르기 / simple=글 3줄+버튼).
// 예전 움직이는 청첩장 3장 안내창은 2026-11-16 제거(청첩장 잘못 누름이 많아서). 되살리려면 git 기록 참고.
const KEY=welcomeStyle==='showcase'?'oi-welcome-v4':'oi-welcome-v3';
// 안내창에서 고르는 4종류. 커플·파티는 3칸이면 끝나서 따로 표시합니다(2026-11-16).
const KINDS:{kind:'wedding'|'baby'|'couple'|'party';icon:string;label:string;fun?:boolean}[]=[{kind:'wedding',icon:'💍',label:'청첩장'},{kind:'baby',icon:'✿',label:'돌잔치'},{kind:'couple',icon:'♥',label:'커플청첩장',fun:true},{kind:'party',icon:'🎉',label:'생일·모임',fun:true}];
export default function BetaNotice({onStart}:{onStart:(kind:'wedding'|'baby'|'couple'|'party')=>void}){const [open,setOpen]=useState(false);const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{if(location.search.includes('resume=')||location.search.includes('make='))return;try{if(!localStorage.getItem(KEY))setOpen(true)}catch{setOpen(true)}},[]);useEffect(()=>{if(open)dialog.current?.showModal()},[open]);function close(){try{localStorage.setItem(KEY,'1')}catch{}dialog.current?.close();setOpen(false)}function start(kind:'wedding'|'baby'|'couple'|'party'){track('notice_start');close();onStart(kind)}function browse(){track('notice_browse');close()}if(!open)return null;
if(welcomeStyle==='showcase')return <dialog ref={dialog} className="beta-notice welcome-show welcome-pick" aria-labelledby="beta-notice-title" onCancel={e=>{e.preventDefault();browse()}}><span className="eyebrow welcome-rise r1">OUR INVITATION</span><h2 id="beta-notice-title" className="welcome-rise r1" tabIndex={-1} autoFocus>어떤 초대장을<br/><em>만들어 볼까요?</em></h2><p className="welcome-sub welcome-rise r2">회원가입 없이 · 휴대폰으로 · {paid?'만들기는 무료':'지금은 무료'}</p><div className="welcome-kinds welcome-rise r3">{KINDS.map(k=><button key={k.kind} type="button" className={k.fun?'fun':''} onClick={()=>start(k.kind)}><span aria-hidden="true">{k.icon}</span><b>{k.label}</b>{k.fun&&<small>3칸이면 끝</small>}</button>)}</div><button className="text-btn welcome-rise r3" onClick={browse}>먼저 둘러볼게요</button></dialog>;
return <dialog ref={dialog} className="beta-notice" aria-labelledby="beta-notice-title" onCancel={e=>{e.preventDefault();browse()}}><span className="eyebrow">OUR INVITATION{paid?'':' · BETA'}</span><h2 id="beta-notice-title">{paid?<>만들기는 무료,<br/><em>발행할 때 {proposedPrice.toLocaleString('ko-KR')}원</em></>:<>지금은 베타 기간이라<br/><em>무료로 만들 수 있어요.</em></>}</h2><p>회원가입 없이, <b>휴대폰으로 5분이면</b> 완성돼요.</p><button className="primary" onClick={()=>start('wedding')}>청첩장 바로 만들기</button><button className="outline" onClick={()=>start('baby')}>돌잔치 초대장 만들기</button><button className="text-btn" onClick={browse}>먼저 둘러볼게요</button></dialog>}
