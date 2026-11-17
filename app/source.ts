'use client';
import type { Source } from './source-names';
import { track } from './track';
import type { Action } from './track-actions';
// 처음 들어온 경로를 30일 동안 기억합니다(광고 주소의 utm, 이전 페이지 주소, 앱 안 브라우저로 판단). 개인정보는 저장하지 않아요.
const KEY='oi-src',DAY='oi-src-day';
function detect():Source{
  const q=new URLSearchParams(location.search),utm=(q.get('utm_source')||'').toLowerCase(),med=(q.get('utm_medium')||'').toLowerCase();
  const ref=(()=>{try{return document.referrer?new URL(document.referrer).hostname:''}catch{return ''}})();const ua=navigator.userAgent;
  if(/^(meta|facebook|fb|instagram|ig)$/.test(utm))return /paid|cpc|ad/.test(med)||q.has('fbclid')?'meta_ad':'meta';
  if(utm.includes('naver'))return /blog/.test(utm+med)?'naver_blog':'naver';
  if(utm.includes('google'))return 'google';if(utm.includes('kakao'))return 'kakao';if(utm.includes('threads'))return 'threads';
  if(ref&&ref===location.hostname)return /^\/i\//.test(new URL(document.referrer).pathname)?'invite':'direct';
  if(/blog\.naver|m\.blog\.naver/.test(ref))return 'naver_blog';if(/naver\./.test(ref))return 'naver';
  if(/google\./.test(ref))return 'google';if(/daum\.net/.test(ref))return 'daum';if(/kakao/.test(ref)||/KAKAOTALK/i.test(ua))return 'kakao';
  if(/threads\.(net|com)/.test(ref)||/Barcelona/.test(ua))return 'threads';
  if(/facebook|instagram/.test(ref)||/FBAN|FBAV|Instagram/.test(ua))return q.has('fbclid')&&/FBAN|FBAV|Instagram/.test(ua)&&!/instagram\.com/.test(ref)?'meta_ad':'meta';
  if(ref)return 'other';return 'direct';
}
// 처음 온 경로(first touch). 새로 온 날엔 하루 1번 방문 경로를 셉니다.
export function rememberSource():Source{let s:Source='direct';try{const saved=JSON.parse(localStorage.getItem(KEY)||'null') as {s:Source;t:number}|null;const fresh=detect();
  // 광고·검색처럼 분명한 경로로 새로 들어오면 그걸로 바꿉니다.
  if(saved&&Date.now()-saved.t<30*86400e3&&fresh==='direct')s=saved.s;else{s=fresh;localStorage.setItem(KEY,JSON.stringify({s,t:Date.now()}))}
  const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);if(localStorage.getItem(DAY)!==today){localStorage.setItem(DAY,today);track(`src_${s}` as Action)}}catch{try{s=detect();track(`src_${s}` as Action)}catch{}}return s}
export function currentSource():Source{try{const saved=JSON.parse(localStorage.getItem(KEY)||'null') as {s:Source}|null;if(saved?.s)return saved.s}catch{}return 'direct'}
