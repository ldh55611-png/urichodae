'use client';
import type { Action } from './track-actions';
// 화면을 막지 않도록 보내고 잊습니다.
export function track(e:Action){try{const body=JSON.stringify({e});if(navigator.sendBeacon)navigator.sendBeacon('/api/track',new Blob([body],{type:'application/json'}));else fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{})}catch{}}
