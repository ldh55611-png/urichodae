'use client';
import type { Design } from './model';
import { KAKAO_JS_KEY } from './kakao-map';
// 카카오톡 공유 버튼: 주소만 붙여넣을 때보다 사진을 크게 보여주고 "청첩장 보기" 버튼을 붙입니다.
// 카카오 개발자 콘솔에 등록한 도메인(urichodae.com)에서만 동작합니다.
type KakaoShare={isInitialized():boolean;init(key:string):void;Share:{sendDefault(o:unknown):void}};
let loading:Promise<KakaoShare>|null=null;
function sdk(){if(loading)return loading;loading=new Promise<KakaoShare>((resolve,reject)=>{const w=window as unknown as {Kakao?:KakaoShare};const ready=()=>{const k=w.Kakao;if(!k)return reject(Error('kakao'));if(!k.isInitialized())k.init(KAKAO_JS_KEY);resolve(k)};if(w.Kakao)return ready();const s=document.createElement('script');s.src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';s.onload=ready;s.onerror=()=>{loading=null;reject(Error('kakao'))};document.head.appendChild(s)});return loading}
// 미리 불러 두면 버튼을 누르자마자 카카오톡이 열립니다(휴대폰은 누른 직후가 아니면 창 열기를 막음).
let kakao:KakaoShare|null=null;const sizes=new Map<string,{w:number;h:number}>();
function cover(d:Design){const c=d.hero[0]?.id;return c?`${location.origin}${c.startsWith('/')?c:'/api/assets/'+c}`:`${location.origin}/og-brand-v1.png`}
export function preloadKakao(d:Design){if(!KAKAO_JS_KEY)return;sdk().then(k=>{kakao=k}).catch(()=>{});const url=cover(d);if(sizes.has(url))return;const img=new Image();img.onload=()=>sizes.set(url,{w:img.naturalWidth,h:img.naturalHeight});img.src=url}
export function shareText(d:Design){const t=new Date(d.date),h=t.getHours();const when=!d.date||isNaN(+t)?d.date.replace('T',' '):`${t.getFullYear()}년 ${t.getMonth()+1}월 ${t.getDate()}일 ${'일월화수목금토'[t.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}시${t.getMinutes()?` ${t.getMinutes()}분`:''}`;return {title:d.names?(d.kind==='baby'?`${d.names}의 첫 번째 생일에 초대합니다`:`${d.names} 결혼합니다`):d.title,description:[when,[d.place,d.hall].filter(Boolean).join(' ')].filter(Boolean).join('\n')}}
export async function shareKakao(d:Design,id:string){const k=kakao||await sdk();const url=`${location.origin}/i/${id}`,imageUrl=cover(d),dim=sizes.get(imageUrl);const {title,description}=shareText(d);const link={mobileWebUrl:url,webUrl:url};k.Share.sendDefault({objectType:'feed',content:{title,description,imageUrl,...(dim?{imageWidth:dim.w,imageHeight:dim.h}:{}),link},buttons:[{title:d.kind==='baby'?'초대장 보기':'청첩장 보기',link}]})}
