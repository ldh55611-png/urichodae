// 초대장 열람 기간 규칙 (2026-11-01 대표 결정)
// - 예식일 다음 날부터 30일 동안 열립니다. (예식일이 5월 1일이면 5월 31일 밤 12시까지)
// - 기간이 끝나면 하객에게는 "기간이 끝난 초대장" 안내만 보입니다.
// - 끝나고 7일 더 사진을 보관했다가 자동으로 지웁니다. 그 7일 안에 영구보관을 하면 다시 열립니다.
// - 영구보관(유료)을 한 초대장은 기간 없이 계속 열립니다. 하객이 올린 사진은 영구보관과 별개로 같은 날 지워집니다.
// - 이 규칙을 처음 적용하는 날(POLICY_START) 전에 예식이 끝난 초대장도 그날부터 30일을 보장합니다.
import { siteMode } from './payment-config';
// - 커플청첩장은 예식일이 없으므로 처음 발행한 날(couple.made)부터 30일 동안 열립니다.
export const viewDate=(d:{kind:string;date:string;couple?:{made?:string}})=>d.kind==='couple'?(d.couple?.made||''):d.date;
export const VIEW_DAYS=30,PHOTO_GRACE_DAYS=7;
export const POLICY_START='2026-11-02';
const DAY=86400e3,KST=9*3600e3;
// 'YYYY-MM-DD...' → 그날 한국 시간 0시(UTC 기준 ms)
function kstMidnight(date:string){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(date||'');if(!m)return NaN;return Date.UTC(+m[1],+m[2]-1,+m[3])-KST}
// 하객이 볼 수 있는 마지막 순간(이 시각부터 닫힘). 날짜가 없으면 null(기간 없음).
export function closesAt(date:string):number|null{const day=kstMidnight(date);if(!Number.isFinite(day))return null;return Math.max(day,kstMidnight(POLICY_START))+(VIEW_DAYS+1)*DAY}
export const purgeAt=(date:string)=>{const c=closesAt(date);return c===null?null:c+PHOTO_GRACE_DAYS*DAY};
// 영구보관 여부: 'forever'는 실제 결제, 'test_forever'는 연습 결제(실제 결제를 켜면 인정하지 않음)
export const isKept=(keep:string|null|undefined)=>keep==='forever'||(keep==='test_forever'&&siteMode!=='live');
export type Retention={kept:boolean;closesAt:number|null;purgeAt:number|null;expired:boolean;purged:boolean};
export function retention(date:string,keep:string|null|undefined,purged:string|null|undefined,now=Date.now()):Retention{const kept=isKept(keep),c=closesAt(date),p=purgeAt(date);return {kept,closesAt:c,purgeAt:p,expired:!kept&&c!==null&&now>=c,purged:!!purged}}
// 화면 표시용: 마지막으로 열리는 날(한국 날짜) 'YYYY.MM.DD'
export function lastDay(ms:number|null){if(ms===null)return '';const t=new Date(ms-1+KST);return `${t.getUTCFullYear()}.${String(t.getUTCMonth()+1).padStart(2,'0')}.${String(t.getUTCDate()).padStart(2,'0')}`}
