export const themes = [
 {id:'sand',label:'샌드',color:'#b49e79'}, {id:'rose',label:'로즈',color:'#b78490'},
 {id:'sage',label:'세이지',color:'#7c937c'}, {id:'lavender',label:'라벤더',color:'#8c7dab'},
 {id:'sky',label:'스카이',color:'#608ca8'}, {id:'peach',label:'피치',color:'#b87759'},
 {id:'navy',label:'네이비',color:'#354e72'}, {id:'burgundy',label:'버건디',color:'#8b455a'},
 {id:'white',label:'화이트',color:'#e9e6e1'}
] as const;
export const luxuryStyles = [
 {id:'classic',label:'클래식',description:'차분한 여백과 정갈한 명조'},
 {id:'romantic',label:'로맨틱',description:'부드러운 곡선과 둥근 사진 프레임'},
 {id:'modern',label:'모던',description:'간결한 고딕과 선명한 구획'},
 {id:'botanical',label:'보태니컬',description:'잎사귀 장식과 아치형 사진'},
 {id:'editorial',label:'에디토리얼',description:'큰 타이포와 매거진 같은 좌측 정렬'},
 {id:'watercolor',label:'워터컬러',description:'수채화처럼 번지는 은은한 배경'},
 {id:'ribbon',label:'리본',description:'리본 장식과 편지 카드 구성'},
 {id:'white',label:'순백',description:'온통 하얀 바탕에 여백과 가는 선만'}
] as const;
// 글씨체: 모두 구글 폰트(OFL, 상업용 사용 가능). 초대장은 고른 글씨체 하나만 불러옵니다.
// adjust: 글자가 작게 보이는 손글씨체를 다른 글씨체와 비슷한 크기로 키우는 값(font-size-adjust cap-height).
export const fontOptions = [
 {id:'nanum-myeongjo',label:'나눔명조',family:'Nanum Myeongjo',weights:'400;700'},
 {id:'gowun-batang',label:'고운바탕',family:'Gowun Batang',weights:'400;700'},
 {id:'song-myung',label:'송명',family:'Song Myung'},
 {id:'diphylleia',label:'디필레이아',family:'Diphylleia'},
 {id:'nanum-brush',label:'나눔붓글씨',family:'Nanum Brush Script',adjust:0.6},
 {id:'nanum-pen',label:'나눔손글씨 펜',family:'Nanum Pen Script',adjust:0.76},
 {id:'hi-melody',label:'하이멜로디',family:'Hi Melody',adjust:0.54},
 {id:'gaegu',label:'개구',family:'Gaegu',weights:'400;700',adjust:0.61},
 {id:'gamja-flower',label:'감자꽃',family:'Gamja Flower',adjust:0.62},
 {id:'yeon-sung',label:'연성',family:'Yeon Sung',adjust:0.72},
 {id:'dongle',label:'동글',family:'Dongle',weights:'400;700',adjust:0.6},
 {id:'jua',label:'주아',family:'Jua'},
 {id:'gowun-dodum',label:'고운돋움',family:'Gowun Dodum'},
 {id:'single-day',label:'싱글데이',family:'Single Day',adjust:0.65}
] as const;
export type FontOption = typeof fontOptions[number];
const familyParam=(f:FontOption)=>'family='+f.family.replace(/ /g,'+')+('weights' in f?':wght@'+f.weights:'');
export const fontHref=(fonts:readonly FontOption[])=>'https://fonts.googleapis.com/css2?'+fonts.map(familyParam).join('&')+'&display=swap';
export const findFont=(id:string|undefined)=>fontOptions.find(f=>f.id===id);
