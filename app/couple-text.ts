// 커플청첩장 문구(서버·화면 공용). 카톡 미리보기 카드, 링크 미리보기, 초대장 화면이 같은 문구를 씁니다.
// D+ 날짜: 사귄 첫날을 D+1로 셉니다(한국 커플 기준).
const DAY=86400e3,KST=9*3600e3;
export function dPlus(since:string,now=Date.now()){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(since||'');if(!m)return null;const start=Date.UTC(+m[1],+m[2]-1,+m[3]),today=Math.floor((now+KST)/DAY)*DAY;const n=Math.floor((today-start)/DAY)+1;return n>0?n:null}
export function sinceLabel(since:string){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(since||'');return m?`${m[1]}. ${+m[2]}. ${+m[3]}.`:''}
export function coupleNames(names:string){const parts=names.split(/\s*[·&,/♥]\s*|\s+그리고\s+/).filter(Boolean);return parts.length>=2?`${parts[0]} ♥ ${parts[1]}`:names}
export function coupleShare(d:{names:string;title:string;couple:{since:string}}){const n=dPlus(d.couple.since);const who=d.names?coupleNames(d.names):'';return {title:who?`${who}, 결혼은 아직이지만 청첩장부터 만들었어요`:d.title.replace(/\n/g,' '),description:[n?`사랑한 지 D+${n.toLocaleString('ko-KR')}`:'',"두 사람의 결혼을 미리 승낙해 주세요"].filter(Boolean).join(' · ')}}
