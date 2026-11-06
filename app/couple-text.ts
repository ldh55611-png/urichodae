// 커플청첩장 문구(서버·화면 공용). 카톡 미리보기 카드, 링크 미리보기, 초대장 화면이 같은 문구를 씁니다.
// D+ 날짜: 사귄 첫날을 D+1로 셉니다(한국 커플 기준).
const DAY=86400e3,KST=9*3600e3;
export function dPlus(since:string,now=Date.now()){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(since||'');if(!m)return null;const start=Date.UTC(+m[1],+m[2]-1,+m[3]),today=Math.floor((now+KST)/DAY)*DAY;const n=Math.floor((today-start)/DAY)+1;return n>0?n:null}
export function sinceLabel(since:string){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(since||'');return m?`${m[1]}. ${+m[2]}. ${+m[3]}.`:''}
export function coupleNames(names:string){const parts=names.split(/\s*[·&,/♥]\s*|\s+그리고\s+/).filter(Boolean);return parts.length>=2?`${parts[0]} ♥ ${parts[1]}`:names}
export function coupleShare(d:{names:string;title:string;couple:{since:string}}){const n=dPlus(d.couple.since);const who=d.names?coupleNames(d.names):'';return {title:who?`${who}, 결혼은 아직이지만 청첩장부터 만들었어요`:d.title.replace(/\n/g,' '),description:[n?`사랑한 지 D+${n.toLocaleString('ko-KR')}`:'',"두 사람의 결혼을 미리 승낙해 주세요"].filter(Boolean).join(' · ')}}
// 파티 초대장 카톡·링크 미리보기 문구: "지우의 생일 파티에 초대합니다" / 날짜 · 장소
import { partyType } from './model';
export function whenLabel(date:string){const t=new Date(date);if(!date||isNaN(+t))return (date||'').replace('T',' ');const h=t.getHours();return `${t.getMonth()+1}월 ${t.getDate()}일 ${'일월화수목금토'[t.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}시${t.getMinutes()?` ${t.getMinutes()}분`:''}`}
export function partyShare(d:{names:string;title:string;date:string;place:string;hall:string;party:{type:string}}){const t=partyType(d.party.type);return {title:d.names?`${t.emoji} ${d.names}의 ${t.label}에 초대합니다`:d.title,description:[whenLabel(d.date),[d.place,d.hall].filter(Boolean).join(' ')].filter(Boolean).join(' · ')||d.title}}
