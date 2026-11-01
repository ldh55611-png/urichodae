'use client';
import {useEffect} from 'react';
// 메타 광고 성과 측정용 픽셀. 메인(제작) 화면에만 달고, 하객이 보는 초대장(/i/...)에는 달지 않습니다.
export const META_PIXEL_ID='2061954517851069';
type Fbq=((...args:unknown[])=>void)&{callMethod?:(...a:unknown[])=>void;queue?:unknown[][];push?:unknown;loaded?:boolean;version?:string};
declare global{interface Window{fbq?:Fbq;_fbq?:Fbq}}
function load(){
  if(window.fbq)return;
  const n:Fbq=Object.assign(function(...args:unknown[]){n.callMethod?n.callMethod(...args):n.queue!.push(args)},{queue:[] as unknown[][],loaded:true,version:'2.0'});
  n.push=n;window.fbq=n;if(!window._fbq)window._fbq=n;
  const s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s);
  n('init',META_PIXEL_ID);
}
// 광고 최적화용 전환 이벤트: Lead=초대장 만들기 시작, CompleteRegistration=발행
export function trackPixel(event:'Lead'|'CompleteRegistration',params?:Record<string,unknown>){try{window.fbq?.('track',event,params)}catch{}}
export default function MetaPixel(){
  useEffect(()=>{try{load();window.fbq?.('track','PageView')}catch{}},[]);
  return <noscript><img height="1" width="1" style={{display:'none'}} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}/></noscript>;
}
