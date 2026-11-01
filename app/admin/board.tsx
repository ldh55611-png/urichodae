'use client';
import { useCallback,useEffect,useMemo,useState } from 'react';
type Item={id:string;maker:string;kind:'wedding'|'baby';names:string;title:string;date:string;place:string;published:boolean;created:string;updated:string;makerSince:string;rsvps:number;guestbook:number;photos:number;bytes:number};
type Stats={today:string;totals:{invitations:number;published:number;todayInvitations:number;todayPublished:number;makers:number;todayMakers:number;rsvps:number;guestbook:number};storage:{fileBytes:number;fileLimit:number;dbBytes:number;dbLimit:number};list:Item[]};
const KEY='urichodae-admin';
const kst=(iso:string)=>{const t=new Date(iso);if(!iso||isNaN(+t))return '';return new Date(+t+9*3600e3).toISOString()};
const day=(iso:string)=>kst(iso).slice(0,10);
const stamp=(iso:string)=>{const k=kst(iso);return k?`${+k.slice(5,7)}/${+k.slice(8,10)} ${k.slice(11,16)}`:'기록 없음'};
const size=(b:number)=>b>=1024**3?`${(b/1024**3).toFixed(2)}GB`:b>=1024**2?`${(b/1024**2).toFixed(1)}MB`:`${Math.round(b/1024)}KB`;
const pct=(a:number,b:number)=>b?Math.min(100,a/b*100):0;
export default function AdminBoard(){
  const [password,setPassword]=useState('');const [stats,setStats]=useState<Stats|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [filter,setFilter]=useState<'today'|'all'|'published'>('today');const [q,setQ]=useState('');const [picked,setPicked]=useState<string[]>([]);const [notice,setNotice]=useState('');
  const load=useCallback(async(pw:string)=>{setBusy(true);setError('');try{const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});const json=await res.json() as Stats&{error?:string};if(!res.ok){setError(json.error||'불러오지 못했습니다.');if(res.status===401)sessionStorage.removeItem(KEY);setStats(null);return}sessionStorage.setItem(KEY,pw);setPassword(pw);setStats(json)}catch{setError('인터넷 연결을 확인해 주세요.')}finally{setBusy(false)}},[]);
  async function remove(ids:string[]){if(!ids.length)return;const word=prompt(`청첩장 ${ids.length}개와 사진·방명록·참석 응답까지 모두 지웁니다. 되돌릴 수 없어요.\n지우려면 "삭제"라고 입력하세요.`);if(word?.trim()!=='삭제')return;setBusy(true);setError('');try{const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,action:'delete',ids})});const json=await res.json() as {deleted?:number;error?:string};if(!res.ok)throw Error(json.error||'지우지 못했습니다.');setPicked([]);setNotice(`${json.deleted??0}개를 지웠습니다.`)}catch(e){setError(e instanceof Error?e.message:'지우지 못했습니다.')}finally{setBusy(false)}await load(password)}
  useEffect(()=>{const saved=sessionStorage.getItem(KEY);if(!saved)return;const t=setTimeout(()=>load(saved),0);return()=>clearTimeout(t)},[load]);
  const list=useMemo(()=>{if(!stats)return [];const word=q.trim();return stats.list.filter(i=>filter==='all'||(filter==='published'?i.published:day(i.created)===stats.today)).filter(i=>!word||[i.names,i.title,i.place,i.maker].some(v=>v.includes(word)))},[stats,filter,q]);
  if(!stats)return <main className="admin"><form className="admin-login" onSubmit={e=>{e.preventDefault();if(password)load(password)}}><h1>관리자</h1><p>우리의 초대 대표 전용 화면입니다.</p><input type="password" autoComplete="current-password" placeholder="관리자 비밀번호" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/><button className="primary" disabled={busy||!password}>{busy?'확인 중…':'들어가기'}</button>{error&&<p className="admin-error">{error}</p>}</form></main>;
  const t=stats.totals,s=stats.storage,filePct=pct(s.fileBytes,s.fileLimit),dbPct=pct(s.dbBytes,s.dbLimit);
  return <main className="admin">
    <header className="admin-head"><div><h1>관리자</h1><p>{stats.today} 기준 (한국 시간)</p></div><div><button className="outline" onClick={()=>load(password)} disabled={busy}>{busy?'불러오는 중…':'새로고침'}</button><button className="text-btn" onClick={()=>{sessionStorage.removeItem(KEY);setStats(null);setPassword('')}}>나가기</button></div></header>
    <section className="admin-cards">
      <div><span>오늘 만든 청첩장</span><b>{t.todayInvitations}</b></div>
      <div><span>오늘 발행</span><b>{t.todayPublished}</b></div>
      <div><span>오늘 처음 온 제작자</span><b>{t.todayMakers}</b></div>
      <div><span>전체 청첩장</span><b>{t.invitations}</b><small>발행 {t.published}</small></div>
      <div><span>전체 제작자</span><b>{t.makers}</b></div>
      <div><span>참석 응답 · 방명록</span><b>{t.rsvps} · {t.guestbook}</b></div>
    </section>
    <section className="admin-storage">
      <div><span>사진·영상 저장 공간</span><b>{size(s.fileBytes)} / 10GB ({filePct.toFixed(1)}%)</b><i><em style={{width:`${filePct}%`}} className={filePct>=50?'warn':''}/></i></div>
      <div><span>데이터 저장 공간</span><b>{s.dbBytes?`${size(s.dbBytes)} / 5GB (${dbPct.toFixed(1)}%)`:'확인 불가'}</b><i><em style={{width:`${dbPct}%`}} className={dbPct>=50?'warn':''}/></i></div>
      {(filePct>=50||dbPct>=50)&&<p className="admin-error">저장 공간이 절반을 넘었습니다. 지난 예식 청첩장 자동 삭제 기능을 만들 때입니다.</p>}
    </section>
    <div className="admin-tools"><div role="group">{([['today','오늘'],['published','발행된 것'],['all','전체']] as const).map(([k,l])=><button key={k} aria-pressed={filter===k} onClick={()=>setFilter(k)}>{l}</button>)}</div><input placeholder="이름·장소·제작자번호 검색" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div className="admin-bulk"><p className="admin-count">{list.length}개{picked.length?` · ${picked.length}개 선택`:''}</p><div><button className="text-btn" onClick={()=>setPicked(picked.length===list.length?[]:list.map(i=>i.id))} disabled={!list.length}>{picked.length===list.length&&list.length?'선택 해제':'모두 선택'}</button><button className="admin-delete" disabled={!picked.length||busy} onClick={()=>remove(picked)}>선택한 것 삭제</button></div></div>{notice&&<p className="admin-notice">{notice}</p>}{error&&<p className="admin-error">{error}</p>}
    <ul className="admin-list">{list.map(i=><li key={i.id}>
      <div className="admin-row-top"><input type="checkbox" aria-label="선택" checked={picked.includes(i.id)} onChange={e=>setPicked(p=>e.target.checked?[...p,i.id]:p.filter(x=>x!==i.id))}/><span className={`admin-tag ${i.kind}`}>{i.kind==='baby'?'돌잔치':'청첩장'}</span><span className={`admin-tag ${i.published?'on':'off'}`}>{i.published?'발행됨':'작성 중'}</span><small>제작자 #{i.maker}</small></div>
      <b>{i.names||<em>이름 미입력</em>}</b>
      <p>{[i.date.replace('T',' '),i.place].filter(Boolean).join(' · ')||'예식 정보 미입력'}</p>
      <small>만든 시각 {stamp(i.created)} · 마지막 수정 {stamp(i.updated)} · 참석 {i.rsvps} · 방명록 {i.guestbook} · 하객사진 {i.photos} · {size(i.bytes)}</small>
      {i.published&&<a href={`/i/${i.id}`} target="_blank" rel="noreferrer">청첩장 보기 ↗</a>}
    </li>)}</ul>
    {!list.length&&<p className="admin-empty">{filter==='today'?'오늘 만든 청첩장이 아직 없습니다.':'해당하는 청첩장이 없습니다.'}</p>}
    <p className="admin-note">이 사이트는 회원가입이 없어 제작자의 이름·연락처는 저장하지 않습니다. 같은 제작자 번호는 같은 사람(같은 기기)이 만든 것입니다. 이번 업데이트 이전에 만든 청첩장은 만든 시각이 기록되어 있지 않습니다.</p>
  </main>;
}
