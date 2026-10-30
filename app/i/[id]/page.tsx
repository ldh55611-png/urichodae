import { env } from 'cloudflare:workers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import InvitationView from '../../invitation-view';
import { normalize } from '../../model';
export const dynamic='force-dynamic';
async function load(id:string){const row=await env.DB?.prepare('SELECT data FROM invitations WHERE id=? AND published=1').bind(id).first<{data:string}>();return row?normalize(JSON.parse(row.data)):null}
function when(date:string){const t=new Date(date);if(!date||isNaN(+t))return date.replace('T',' ');const h=t.getHours();return `${t.getFullYear()}년 ${t.getMonth()+1}월 ${t.getDate()}일 ${'일월화수목금토'[t.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}시${t.getMinutes()?` ${t.getMinutes()}분`:''}`}
// 카톡·문자로 주소를 보내면 메인 사진 1장과 제목이 미리보기 카드로 뜨게 합니다.
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;const d=await load(id);if(!d)return {};const title=d.names?(d.kind==='baby'?`${d.names}의 첫 번째 생일에 초대합니다`:`${d.names} 결혼합니다`):d.title;const description=[when(d.date),[d.place,d.hall].filter(Boolean).join(' ')].filter(Boolean).join(' · ')||d.title;const cover=d.hero[0]?.id;const images=cover?[{url:`/api/assets/${cover}`,alt:title}]:[{url:'/og-brand-v1.png',width:1200,height:630,alt:title}];return {title,description,openGraph:{type:'website',locale:'ko_KR',siteName:'우리의 초대',title,description,url:`/i/${id}`,images},twitter:{card:'summary_large_image',title,description,images:images.map(i=>i.url)}}}
export default async function Invite({params}:{params:Promise<{id:string}>}){const {id}=await params;const d=await load(id);if(!d)notFound();return <div className="public-invite"><InvitationView data={d} id={id}/></div>}
