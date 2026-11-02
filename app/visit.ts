import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import type { Action } from './track-actions';
// 방문자 수 세기: 하루에 같은 사람(접속 주소+브라우저)은 1명으로 셉니다. 접속 주소는 그대로 저장하지 않고 알아볼 수 없게 바꿔서 저장합니다.
const BOT=/bot|crawl|spider|slurp|preview|scrap|facebookexternalhit|kakaotalk-scrap|yeti|daum|bingpreview|headless|lighthouse|curl|wget|python|axios/i;
// 메인 화면 행동도 같은 표에 kind 이름만 달리해서 셉니다(하루 같은 사람 1명).
export async function recordVisit(kind:'home'|'invite'|Action){try{const DB=env.DB;if(!DB)return;const h=await headers();const ua=h.get('user-agent')||'';if(!ua||BOT.test(ua))return;const ip=h.get('cf-connecting-ip')||h.get('x-forwarded-for')||'';const day=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);const raw=new TextEncoder().encode(`${day}|${ip}|${ua}|urichodae`);const visitor=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw))).slice(0,12).map(b=>b.toString(16).padStart(2,'0')).join('');await DB.prepare('INSERT INTO visits(day,kind,visitor,views) VALUES(?,?,?,1) ON CONFLICT(day,kind,visitor) DO UPDATE SET views=views+1').bind(day,kind,visitor).run()}catch{}}
