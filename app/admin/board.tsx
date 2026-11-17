'use client';
import { useCallback,useEffect,useMemo,useState } from 'react';
import { SOURCE_LABEL } from '../source-names';
type Item={id:string;publishedAt:string;source:string;maker:string;kind:'wedding'|'baby'|'couple'|'party';names:string;title:string;date:string;place:string;published:boolean;created:string;updated:string;makerSince:string;rsvps:number;guestbook:number;photos:number;bytes:number;steps:{names:boolean;date:boolean;place:boolean;hero:boolean}};
type Sales={todayAmount:number;todayCount:number;totalAmount:number;totalCount:number;testTodayAmount:number;testTodayCount:number};type Visit={day:string;home:number;invite:number;views:number;start?:number;noticeStart?:number;noticeBrowse?:number;sample?:number;video?:number;made?:number;makeFail?:number};
type Steps={made:number;names:number;date:number;place:number;hero:number;complete:number;published:number};type Funnel={recent:Steps;all:Steps;actions:{publishClick:number;publishMissing:number;resumeSend:number;resumeBack:number}};
type FunDay={day:string;coupleStart:number;coupleMade:number;couplePublished:number;coupleYes:number;partyStart:number;partyMade:number;partyPublished:number;partyGoing:number};type Fun={days:FunDay[];couple:{made:number;published:number;yes:number};party:{made:number;published:number;going:number;notGoing:number}};
type SrcRow={src:string;visit:number;made:number;filled:number;published:number};type ConvRow={sources:SrcRow[];visit:number;start:number;made:number;drafts:number;filled:number;complete:number;published:number;blank:{mistake:number;left:number;design:number}};type ConvKind='all'|'wedding'|'baby'|'couple'|'party';type Conv=Record<'today'|'week',Record<ConvKind,ConvRow>>;
type Stats={conv?:Conv;fun?:Fun;funnel?:Funnel;today:string;sales?:Sales;visits?:Visit[];totals:{invitations:number;published:number;todayInvitations:number;todayPublished:number;makers:number;todayMakers:number;rsvps:number;guestbook:number};storage:{fileBytes:number;fileLimit:number;dbBytes:number;dbLimit:number};list:Item[]};
const KEY='urichodae-admin';
const kst=(iso:string)=>{const t=new Date(iso);if(!iso||isNaN(+t))return '';return new Date(+t+9*3600e3).toISOString()};
const day=(iso:string)=>kst(iso).slice(0,10);
const stamp=(iso:string)=>{const k=kst(iso);return k?`${+k.slice(5,7)}/${+k.slice(8,10)} ${k.slice(11,16)}`:'기록 없음'};
const size=(b:number)=>b>=1024**3?`${(b/1024**3).toFixed(2)}GB`:b>=1024**2?`${(b/1024**2).toFixed(1)}MB`:`${Math.round(b/1024)}KB`;
const pct=(a:number,b:number)=>b?Math.min(100,a/b*100):0;
export default function AdminBoard(){
  const [password,setPassword]=useState('');const [stats,setStats]=useState<Stats|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [filter,setFilter]=useState<'today'|'all'|'published'|'fun'>('today');const [q,setQ]=useState('');const [picked,setPicked]=useState<string[]>([]);const [notice,setNotice]=useState('');const [showEmpty,setShowEmpty]=useState(false);const [period,setPeriod]=useState<'today'|'week'>('week');const [ck,setCk]=useState<ConvKind>('all');const [pk,setPk]=useState<ConvKind>('all');
  const load=useCallback(async(pw:string)=>{setBusy(true);setError('');try{const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});const json=await res.json() as Stats&{error?:string};if(!res.ok){setError(json.error||'불러오지 못했습니다.');if(res.status===401)sessionStorage.removeItem(KEY);setStats(null);return}sessionStorage.setItem(KEY,pw);setPassword(pw);setStats(json)}catch{setError('인터넷 연결을 확인해 주세요.')}finally{setBusy(false)}},[]);
  async function remove(ids:string[]){if(!ids.length)return;const word=prompt(`청첩장 ${ids.length}개와 사진·방명록·참석 응답까지 모두 지웁니다. 되돌릴 수 없어요.\n지우려면 "삭제"라고 입력하세요.`);if(word?.trim()!=='삭제')return;setBusy(true);setError('');try{const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,action:'delete',ids})});const json=await res.json() as {deleted?:number;error?:string};if(!res.ok)throw Error(json.error||'지우지 못했습니다.');setPicked([]);setNotice(`${json.deleted??0}개를 지웠습니다.`)}catch(e){setError(e instanceof Error?e.message:'지우지 못했습니다.')}finally{setBusy(false)}await load(password)}
  useEffect(()=>{const saved=sessionStorage.getItem(KEY);if(!saved)return;const t=setTimeout(()=>load(saved),0);return()=>clearTimeout(t)},[load]);
  // 만들기 버튼만 누르고 아무것도 안 쓴 초안(빈 초안)은 기본으로 숨깁니다.
  const blank=(i:Stats['list'][number])=>!i.published&&!i.steps.names&&!i.steps.date&&!i.place&&!i.steps.hero;
  const scoped=useMemo(()=>{if(!stats)return [];const word=q.trim();return stats.list.filter(i=>filter==='all'||(filter==='fun'?i.kind==='couple'||i.kind==='party':filter==='published'?i.published:day(i.created)===stats.today)).filter(i=>!word||[i.names,i.title,i.place,i.maker].some(v=>v.includes(word)))},[stats,filter,q]);
  const hidden=scoped.filter(blank).length;const list=showEmpty?scoped:scoped.filter(i=>!blank(i));
  if(!stats)return <main className="admin"><form className="admin-login" onSubmit={e=>{e.preventDefault();if(password)load(password)}}><h1>관리자</h1><p>우리의 초대 대표 전용 화면입니다.</p><input type="password" autoComplete="current-password" placeholder="관리자 비밀번호" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/><button className="primary" disabled={busy||!password}>{busy?'확인 중…':'들어가기'}</button>{error&&<p className="admin-error">{error}</p>}</form></main>;
  const s=stats.storage,filePct=pct(s.fileBytes,s.fileLimit),dbPct=pct(s.dbBytes,s.dbLimit);
  return <main className="admin">
    <header className="admin-head"><div><h1>관리자</h1><p>{stats.today} 기준 (한국 시간)</p></div><div><button className="outline" onClick={()=>load(password)} disabled={busy}>{busy?'불러오는 중…':'새로고침'}</button><button className="text-btn" onClick={()=>{sessionStorage.removeItem(KEY);setStats(null);setPassword('')}}>나가기</button></div></header>
    {(()=>{const sl=stats.sales,vs=stats.visits||[],td=vs[vs.length-1];const won=(n:number)=>n.toLocaleString('ko-KR')+'원';return <><section className="admin-cards admin-top">
      <div><span>오늘 결제 금액</span><b>{won(sl?.todayAmount||0)}</b><small>{sl?.todayCount||0}건 · 누적 {won(sl?.totalAmount||0)}{sl?.testTodayCount?` · 연습 ${sl.testTodayCount}건`:''}</small></div>
      <div><span>오늘 방문자</span><b>{(td?.home||0)+(td?.invite||0)}명</b><small>메인 {td?.home||0} · 청첩장 보러 온 하객 {td?.invite||0}</small></div>
    </section>
</>})()}
    {stats.conv&&(()=>{const c=stats.conv[period][ck];const name={all:'전체',wedding:'청첩장',baby:'돌잔치',couple:'커플청첩장',party:'파티 초대장'}[ck];
      const steps:[string,number,string][]=[...(ck==='all'?[['메인 방문',c.visit,'메인 화면에 들어온 사람']] as [string,number,string][]:[]),['만들기 누름',c.start,'만들기 버튼을 누른 사람'],['초대장 생김',c.made,'실제로 초대장이 만들어진 사람'],['내용 입력',c.filled,'이름·날짜·장소·사진 중 하나라도 쓴 사람'],...(ck==='wedding'||ck==='baby'?[['필수 5칸 다 채움',c.complete,'발행할 준비가 된 사람']] as [string,number,string][]:[]),['발행 완료',c.published,'초대장을 발행한 사람']];
      const top=steps[0][1],last=steps[steps.length-1][1];const rate=(a:number,b:number)=>b?Math.round(Math.min(a,b)/b*100):0;
      let worst=-1,worstLoss=0;steps.forEach((x,n)=>{if(!n)return;const loss=steps[n-1][1]-Math.min(x[1],steps[n-1][1]);if(steps[n-1][1]>0&&loss>worstLoss){worst=n;worstLoss=loss}});
      const b=c.blank,blanks=b.mistake+b.left+b.design;
      return <section className="conv"><div className="conv-head"><h2>전환율 한눈에 보기</h2><div role="group">{([['today','오늘'],['week','최근 7일']] as const).map(([k,l])=><button key={k} aria-pressed={period===k} onClick={()=>setPeriod(k)}>{l}</button>)}</div></div>
        <div className="conv-kinds" role="group">{([['all','전체'],['wedding','청첩장'],['baby','돌잔치'],['couple','커플'],['party','파티']] as const).map(([k,l])=><button key={k} aria-pressed={ck===k} onClick={()=>setCk(k)}>{l}<small>발행 {stats.conv![period][k].made?Math.round(stats.conv![period][k].published/stats.conv![period][k].made*100):0}%</small></button>)}</div>
        <div className="conv-big"><div><span>{name}: {steps[0][0]} → 발행</span><b>{top?rate(last,top):0}%</b><small>{top}명 중 {last}명 발행</small></div><div><span>초대장 만든 사람 → 발행</span><b>{rate(c.published,c.made)}%</b><small>{c.made}명 중 {c.published}명</small></div></div>
        <ol className="conv-steps">{steps.map(([l,v,tip],n)=>{const prev=n?steps[n-1][1]:0;return <li key={l} className={n===worst?'worst':''}>{n>0&&<p className="conv-arrow">↓ 다음 단계로 <b>{rate(v,prev)}%</b>{prev>v?` · ${prev-v}명 빠짐`:''}{n===worst&&<em>여기서 가장 많이 빠져요</em>}</p>}<div className="conv-row"><span title={tip}>{l}</span><i><em style={{width:`${top?Math.max(v?3:0,v/top*100):0}%`}}/></i><b>{v}명</b></div></li>})}</ol>
        {blanks>0&&<p className="conv-blank">아무것도 안 쓴 빈 초안 <b>{blanks}개</b>: 잘못 누름 <b>{b.mistake}</b>(곧바로 다른 종류를 다시 만듦) · 열고 바로 나감 <b>{b.left}</b> · 디자인만 만지고 나감 <b>{b.design}</b></p>}
        {(()=>{const srcName=(k:string)=>k==='unknown'?'경로 기록 전 (11/17 이전에 만든 것)':(SOURCE_LABEL as Record<string,string>)[k]||k;const rs=[...c.sources].sort((a,b)=>b.published-a.published||b.made-a.made||b.visit-a.visit);return <><h3 className="conv-h3">어디서 들어왔나</h3>{rs.length?<div className="admin-table-wrap"><table className="admin-visits conv-src"><thead><tr><th>들어온 곳</th>{ck==='all'&&<th>방문</th>}<th>만든 사람</th><th>내용 입력</th><th>발행</th><th>{ck==='all'?'방문→발행':'만든 사람→발행'}</th></tr></thead><tbody>{rs.map(r=>{const base=ck==='all'?r.visit:r.made;return <tr key={r.src}><td>{srcName(r.src)}</td>{ck==='all'&&<td>{r.src==='unknown'?'-':r.visit}</td>}<td>{r.made}</td><td>{r.filled}</td><td><b>{r.published}</b></td><td>{base?Math.round(Math.min(r.published,base)/base*100)+'%':'-'}</td></tr>})}</tbody></table></div>:<p className="conv-blank">아직 기록이 없어요.</p>}</>})()}
        <p className="admin-note admin-note-top">같은 사람이 여러 개 만들어도 1명으로 셉니다. 최근 7일 방문·만들기 누름은 날마다 센 사람 수를 더한 값이에요. 청첩장·돌잔치 ‘만들기 누름’과 ‘들어온 곳’은 11/17부터 셉니다. 들어온 곳은 처음 들어온 경로 기준이에요(30일 기억).</p></section>})()}
    <section className="admin-storage">
      <div><span>사진·영상 저장 공간</span><b>{size(s.fileBytes)} / 10GB ({filePct.toFixed(1)}%)</b><i><em style={{width:`${filePct}%`}} className={filePct>=50?'warn':''}/></i></div>
      <div><span>데이터 저장 공간</span><b>{s.dbBytes?`${size(s.dbBytes)} / 5GB (${dbPct.toFixed(1)}%)`:'확인 불가'}</b><i><em style={{width:`${dbPct}%`}} className={dbPct>=50?'warn':''}/></i></div>
      {(filePct>=50||dbPct>=50)&&<p className="admin-error">저장 공간이 절반을 넘었습니다. 지난 예식 청첩장 자동 삭제 기능을 만들 때입니다.</p>}
    </section>
    {(()=>{const kindName=(k:string)=>k==='baby'?'돌잔치':k==='couple'?'커플':k==='party'?'파티':'청첩장';const pubs=stats.list.filter(i=>i.published).sort((a,b)=>(b.publishedAt||b.updated).localeCompare(a.publishedAt||a.updated));const shown=pubs.filter(i=>pk==='all'||i.kind===pk);const isToday=(i:Item)=>!!i.publishedAt&&day(i.publishedAt)===stats.today;
      const card=(i:Item)=><li key={i.id}><span className={`admin-tag ${i.kind}`}>{kindName(i.kind)}</span><b>{i.title||i.names||'이름 없음'}</b><small>{i.names&&i.title?i.names+' · ':''}발행 {i.publishedAt?stamp(i.publishedAt):'기록 없음'}{i.source?` · ${(SOURCE_LABEL as Record<string,string>)[i.source]||i.source}`:''}</small><a href={`/i/${i.id}`} target="_blank" rel="noreferrer">보기 ↗</a></li>;
      const today=shown.filter(isToday),before=shown.filter(i=>!isToday(i));
      return <section className="conv"><div className="conv-head"><h2>발행된 초대장</h2><span className="conv-total">전체 {pubs.length}개</span></div>
        <div className="conv-kinds" role="group">{([['all','전체'],['wedding','청첩장'],['baby','돌잔치'],['couple','커플'],['party','파티']] as const).map(([k,l])=><button key={k} aria-pressed={pk===k} onClick={()=>setPk(k)}>{l}<small>{pubs.filter(i=>k==='all'||i.kind===k).length}</small></button>)}</div>
        <h3 className="conv-h3">오늘 발행 {today.length}개</h3>{today.length?<ul className="conv-pub">{today.map(card)}</ul>:<p className="conv-blank">오늘 발행된 초대장이 아직 없어요.</p>}
        <h3 className="conv-h3">그동안 발행 {before.length}개</h3>{before.length?<ul className="conv-pub">{before.map(card)}</ul>:<p className="conv-blank">아직 없어요.</p>}
      </section>})()}
    <details className="admin-manage"><summary>초대장 전체 목록 · 삭제 <small>필요할 때만 열어 보세요</small></summary>
    <div className="admin-tools"><div role="group">{([['today','오늘 만든 것'],['all','전체']] as const).map(([k,l])=><button key={k} aria-pressed={filter===k} onClick={()=>setFilter(k)}>{l}</button>)}</div><input placeholder="이름·장소·제작자번호 검색" value={q} onChange={e=>setQ(e.target.value)}/></div>
    {hidden>0&&<p className="admin-blank">아무것도 안 쓰고 나간 빈 초안 <b>{hidden}개</b>{showEmpty?'도 함께 보는 중':'는 숨겼어요'} <button type="button" onClick={()=>setShowEmpty(v=>!v)}>{showEmpty?'다시 숨기기':'보기'}</button></p>}
    <div className="admin-bulk"><p className="admin-count">{list.length}개{picked.length?` · ${picked.length}개 선택`:''}</p><div><button className="text-btn" onClick={()=>setPicked(picked.length===list.length?[]:list.map(i=>i.id))} disabled={!list.length}>{picked.length===list.length&&list.length?'선택 해제':'모두 선택'}</button><button className="admin-delete" disabled={!picked.length||busy} onClick={()=>remove(picked)}>선택한 것 삭제</button></div></div>{notice&&<p className="admin-notice">{notice}</p>}{error&&<p className="admin-error">{error}</p>}
    <ul className="admin-list">{list.map(i=><li key={i.id}>
      <div className="admin-row-top"><input type="checkbox" aria-label="선택" checked={picked.includes(i.id)} onChange={e=>setPicked(p=>e.target.checked?[...p,i.id]:p.filter(x=>x!==i.id))}/><span className={`admin-tag ${i.kind}`}>{i.kind==='baby'?'돌잔치':i.kind==='couple'?'커플':i.kind==='party'?'파티':'청첩장'}</span><span className={`admin-tag ${i.published?'on':'off'}`}>{i.published?'발행됨':'작성 중'}</span><small>제작자 #{i.maker}</small></div>
      <b>{i.names||<em>이름 미입력</em>}</b>
      <p>{[i.date.replace('T',' '),i.place].filter(Boolean).join(' · ')||(i.kind==='couple'?'사귄 날 미입력':i.kind==='party'?'파티 날짜·장소 미입력':'예식 정보 미입력')}</p>
      <small>만든 시각 {stamp(i.created)} · 마지막 수정 {stamp(i.updated)} · 참석 {i.rsvps} · 방명록 {i.guestbook} · 하객사진 {i.photos} · {size(i.bytes)}</small>
      {i.published&&<a href={`/i/${i.id}`} target="_blank" rel="noreferrer">청첩장 보기 ↗</a>}
    </li>)}</ul>
    {!list.length&&<p className="admin-empty">{filter==='today'?'오늘 만든 청첩장이 아직 없습니다.':'해당하는 청첩장이 없습니다.'}</p>}
    </details>
    <p className="admin-note">이 사이트는 회원가입이 없어 제작자의 이름·연락처는 저장하지 않습니다. 같은 제작자 번호는 같은 사람(같은 기기)이 만든 것입니다. 이번 업데이트 이전에 만든 청첩장은 만든 시각이 기록되어 있지 않습니다. 방문자는 하루 기준으로 같은 사람(같은 기기)을 1명으로 세고, 검색 로봇은 뺍니다.</p>
  </main>;
}
