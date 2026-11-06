import { env } from 'cloudflare:workers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import InvitationView from '../../invitation-view';
import { recordVisit } from '../../visit';
import { normalize } from '../../model';
import { coupleShare,partyShare } from '../../couple-text';
import { publicFilter } from '../../api/payment';
import { retention,viewDate } from '../../retention';
export const dynamic='force-dynamic';
async function load(id:string){const row=await env.DB?.prepare('SELECT data,keep,purged FROM invitations WHERE id=? AND published=1'+publicFilter()).bind(id).first<{data:string;keep:string;purged:string}>();if(!row)return null;const d=normalize(JSON.parse(row.data));return Object.assign(d,{expired:retention(viewDate(d),row.keep,row.purged).expired})}
function when(date:string){const t=new Date(date);if(!date||isNaN(+t))return date.replace('T',' ');const h=t.getHours();return `${t.getFullYear()}년 ${t.getMonth()+1}월 ${t.getDate()}일 ${'일월화수목금토'[t.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}시${t.getMinutes()?` ${t.getMinutes()}분`:''}`}
function metaText(d:ReturnType<typeof normalize>){if(d.kind==='couple')return coupleShare(d);if(d.kind==='party')return partyShare(d);const title=d.names?(d.kind==='baby'?`${d.names}의 첫 번째 생일에 초대합니다`:`${d.names} 결혼합니다`):d.title;return {title,description:[when(d.date),[d.place,d.hall].filter(Boolean).join(' ')].filter(Boolean).join(' · ')||d.title}}
// 개인 정보가 담긴 초대장이라 검색에는 나오지 않게 합니다(noindex). 카톡·문자로 주소를 보내면 메인 사진 1장과 제목이 미리보기 카드로 뜨게 합니다.
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;const d=await load(id);if(!d)return {robots:{index:false,follow:false}};if(d.expired)return {title:'기간이 끝난 초대장 | 우리의 초대',robots:{index:false,follow:false}};const {title,description}=metaText(d);const cover=d.hero[0]?.id;const images=cover?[{url:`/api/assets/${cover}`,alt:title}]:[{url:'/og-brand-v1.png',width:1200,height:630,alt:title}];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',locale:'ko_KR',siteName:'우리의 초대',title,description,url:`/i/${id}`,images},twitter:{card:'summary_large_image',title,description,images:images.map(i=>i.url)}}}
export default async function Invite({params}:{params:Promise<{id:string}>}){const {id}=await params;const d=await load(id);if(!d)notFound();await recordVisit('invite');
  // 열람 기간(예식일 다음 날부터 30일)이 끝난 초대장은 안내만 보여 줍니다.
  if(d.expired)return <main className="public-invite"><div className="expired-invite"><small>THANK YOU</small><h1>기간이 끝난 초대장이에요</h1><p>{d.names?`${d.names}의 `:''}초대장은 열람 기간이 끝났어요.<br/>함께 축하해 주셔서 고맙습니다.</p><Link href="/">우리의 초대 둘러보기</Link></div></main>;
  return <div className="public-invite"><InvitationView data={d} id={id}/></div>}
