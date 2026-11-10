import { z } from 'zod';
// 단일 상품(럭셔리)으로 통일. tier 값은 예전 저장본 호환용으로만 남기고 항상 premium으로 정규화합니다.
export const tiers={premium:{label:'럭셔리',main:3,gallery:30}} as const;
export const tierLimit=tiers.premium;
// 청첩장 곡은 Pixabay 음원(상업적 이용 가능, 출처 표기 불필요), 돌잔치 곡은 저작권 만료곡·자작곡을 직접 합성한 음원입니다.
export const presetMusic=[
 {id:'/music/romantic-wedding.mp3',kind:'wedding',label:'로맨틱 웨딩',description:'따뜻한 피아노와 현악 · 2분'},
 {id:'/music/love-untold.mp3',kind:'wedding',label:'어 러브 언톨드',description:'잔잔한 웨딩 피아노 · 3분 30초'},
 {id:'/music/wedding-background.mp3',kind:'wedding',label:'로맨틱 배경음악',description:'부드러운 어쿠스틱 · 3분'},
 {id:'/music/wedding-joy.mp3',kind:'wedding',label:'웨딩 조이',description:'밝고 경쾌한 분위기 · 2분 20초'},
 {id:'/music/vow-exchange.mp3',kind:'wedding',label:'서약의 순간',description:'차분하고 서정적인 연주 · 3분 10초'},
 {id:'/music/garden-ceremony.mp3',kind:'wedding',label:'가든 세리머니',description:'화사한 야외 예식 느낌 · 3분'},
 {id:'/music/lullaby.mp3',kind:'baby',label:'브람스 자장가',description:'브람스 · 포근한 오르골'},
 {id:'/music/twinkle.mp3',kind:'baby',label:'반짝반짝 작은 별',description:'프랑스 민요 · 맑은 오르골'},
 {id:'/music/musicbox.mp3',kind:'baby',label:'오르골 산책',description:'우리의 초대 오리지널 · 경쾌한 오르골'}
] as const;
const retiredMusic=['/music/canon.mp3','/music/bridal.mp3','/music/waltz.mp3'];
export const isPresetMusic=(id:string)=>presetMusic.some(m=>m.id===id);
const short=z.string().max(200),long=z.string().max(3000),photo=z.object({id:short,y:z.number().min(0).max(100),zoom:z.number().min(1).max(2)});
const account=z.object({side:z.enum(['groom','bride']).default('groom'),label:short,bank:short,holder:short,number:short});
export const schema=z.object({kind:z.enum(['wedding','baby','couple','party']),tier:z.enum(['standard','deluxe','premium']).transform(()=>'premium' as const),// 어두운 디자인(차콜·아르데코·별빛)은 2026-10-30 폐지 → 예전 저장본은 화이트·순백으로 바꿉니다.
 theme:z.enum(['sand','rose','sage','lavender','sky','peach','navy','burgundy','white','charcoal']).transform(t=>t==='charcoal'?'white':t),style:z.enum(['classic','romantic','modern','botanical','editorial','watercolor','ribbon','white','artdeco','celestial']).transform(v=>v==='artdeco'||v==='celestial'?'white':v),title:short,names:short,date:short,place:short,address:short,message:long,initials:short,hero:z.array(photo).max(3),gallery:z.array(photo).max(30),music:short.transform(m=>retiredMusic.includes(m)?presetMusic[0].id:m),video:short,parents:z.array(z.object({label:short,name:short,absent:z.boolean(),phone:z.string().max(20).default('')})).max(4),accounts:z.array(account).max(10),stories:z.array(z.object({date:short,title:short,text:long})).max(20),letter:long,
 allowZoom:z.boolean().default(false),
 font:short.default(''),
 hall:short.default(''),
 map:z.object({mode:z.enum(['interactive','static','none']).default('interactive'),image:short.default('')}).default({}),
 transport:z.array(z.object({title:short,text:long})).max(8).default([]),
 contacts:z.object({groom:z.string().max(20).default(''),bride:z.string().max(20).default('')}).default({}),
 calendar:z.boolean().default(true),
 opening:z.boolean().default(true),
 galleryLayout:z.enum(['grid','slide']).default('grid'),
 guestbook:z.object({enabled:z.boolean().default(true)}).default({}),
 rsvp:z.object({enabled:z.boolean().default(false),meal:z.boolean().default(false),bus:z.boolean().default(false),busInfo:long.default(''),deadline:short.default('')}).default({}),
 guestPhotos:z.object({enabled:z.boolean().default(false)}).default({}),
 // 커플청첩장(결혼 전 커플이 재미로 만드는 가상 청첩장): 사귄 날(D+), 서약 조항, 만든 날(열람 기간 기준)
 couple:z.object({since:short.default(''),pledges:z.array(short).max(10).default([]),made:short.default('')}).default({}),
 // 파티 초대장(생일·홈파티·집들이·연말모임 등): 종류만 따로 저장하고 나머지는 이름(주인공)·날짜·장소·주소·사진·한마디를 그대로 씁니다.
 party:z.object({type:z.enum(['birthday','home','housewarming','yearend','etc']).default('birthday')}).default({})
});
export type Design=z.output<typeof schema>;
export type Invitation={id:string;data:Design;published:boolean;updated:string;keep?:string;purged?:string};
export const defaultAccounts=():Design['accounts']=>[{side:'groom',label:'신랑',bank:'',holder:'',number:''},{side:'groom',label:'신랑 아버님',bank:'',holder:'',number:''},{side:'groom',label:'신랑 어머님',bank:'',holder:'',number:''},{side:'bride',label:'신부',bank:'',holder:'',number:''},{side:'bride',label:'신부 아버님',bank:'',holder:'',number:''},{side:'bride',label:'신부 어머님',bank:'',holder:'',number:''}];
export type Kind=Design['kind'];
export const kindLabel=(k:Kind)=>k==='baby'?'돌잔치':k==='couple'?'커플청첩장':k==='party'?'파티 초대장':'청첩장';
// 결제 없이 발행하는 '놀이용' 초대장(사람 모으는 용도)
export const isFreeKind=(k:string|undefined)=>k==='couple'||k==='party';
// 만들기만 누르고 아무것도 안 쓴 초안(빈 초안). 관리자 화면의 '빈 초안'과 같은 기준이에요.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBlankDraft=(x:any,published:boolean)=>!published&&!x?.names?.trim()&&!(x?.kind==='couple'?x?.couple?.since:x?.date&&Number.isFinite(Date.parse(x.date)))&&!x?.place?.trim()&&!(Array.isArray(x?.hero)&&x.hero.length>0);
export type PartyType=Design['party']['type'];
export const partyTypes:{id:PartyType;label:string;emoji:string;eyebrow:string;invite:string;title:string;message:string}[]=[
 {id:'birthday',label:'생일 파티',emoji:'🎂',eyebrow:'HAPPY BIRTHDAY',invite:'생일 파티에 초대합니다',title:'생일 파티에 놀러 오세요!',message:'일 년에 딱 하루, 제일 신나는 날!\n맛있는 거 먹고 같이 놀아요.\n몸만 오셔도 충분해요.'},
 {id:'home',label:'홈파티',emoji:'🥂',eyebrow:'HOME PARTY',invite:'홈파티에 초대합니다',title:'우리 집에서 같이 놀아요',message:'좋아하는 사람들과 편하게 모이고 싶어서\n작은 홈파티를 열어요.\n편한 옷 입고 놀러 오세요.'},
 {id:'housewarming',label:'집들이',emoji:'🏠',eyebrow:'HOUSEWARMING',invite:'집들이에 초대합니다',title:'새 집에 놀러 오세요',message:'드디어 새 보금자리로 이사했어요.\n따뜻한 밥 한 끼 같이 해요.\n휴지는 안 사 오셔도 돼요!'},
 {id:'yearend',label:'연말 모임',emoji:'🎄',eyebrow:'YEAR-END PARTY',invite:'연말 모임에 초대합니다',title:'올해 마무리는 같이 해요',message:'한 해 동안 고마웠던 사람들과\n웃으면서 올해를 보내고 싶어요.\n그날 꼭 만나요.'},
 {id:'etc',label:'기타 모임',emoji:'🎉',eyebrow:'YOU ARE INVITED',invite:'모임에 초대합니다',title:'함께해요!',message:'반가운 얼굴들 보고 싶어서 자리를 만들었어요.\n그날 꼭 와 주세요.'}
];
export const partyType=(t:string|undefined)=>partyTypes.find(p=>p.id===t)||partyTypes[0];
function partyDefaults():Design{const t=partyTypes[0];return {...defaults('wedding'),kind:'party',title:t.title,message:t.message,parents:[],accounts:[],stories:[],transport:[],calendar:true,opening:false,party:{type:t.id}}}
export const couplePledges=['싸우면 먼저 연락하고, 잠들기 전엔 꼭 화해하기','기념일은 둘 다 챙기기 (잊으면 맛집 쏘기)','서로의 가족과 친구를 내 사람처럼 아끼기'];
// 한국 날짜 YYYY-MM-DD
export const kstToday=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
function coupleDefaults():Design{return {...defaults('wedding'),kind:'couple',title:'결혼은 아직이지만,\n청첩장부터 만들었어요',message:'아직 결혼식 날짜는 없지만\n마음만은 이미 서로에게 약속했어요.\n우리의 결혼을 미리 승낙해 주세요.',parents:[],accounts:[],stories:[],transport:[],calendar:false,couple:{since:'',pledges:[...couplePledges],made:''}}}
export function defaults(kind:Kind='wedding'):Design{if(kind==='couple')return coupleDefaults();if(kind==='party')return partyDefaults();return {kind,tier:'premium',theme:'sand',style:'classic',title:kind==='wedding'?'우리, 함께하는 시작':'우리 아이의 첫 번째 생일',names:'',date:'',place:'',address:'',message:kind==='wedding'?'서로에게 가장 편안한 쉼이 되어\n이제 같은 길을 걸으려 합니다.\n소중한 날, 따뜻한 마음으로 함께해 주세요.':'작은 웃음으로 찾아온 우리 아이가\n어느새 첫 번째 생일을 맞았습니다.\n소중한 첫걸음을 함께 축하해 주세요.',initials:'',hero:[],gallery:[],music:'',video:'',parents:kind==='wedding'?[{label:'신랑 아버님',name:'',absent:false,phone:''},{label:'신랑 어머님',name:'',absent:false,phone:''},{label:'신부 아버님',name:'',absent:false,phone:''},{label:'신부 어머님',name:'',absent:false,phone:''}]:[{label:'아빠',name:'',absent:false,phone:''},{label:'엄마',name:'',absent:false,phone:''}],accounts:kind==='wedding'?defaultAccounts():[{side:'groom',label:'아빠',bank:'',holder:'',number:''},{side:'groom',label:'엄마',bank:'',holder:'',number:''}],stories:[{date:'',title:'',text:''},{date:'',title:'',text:''},{date:'',title:'',text:''}],letter:'',allowZoom:false,font:'',hall:'',map:{mode:'interactive',image:''},transport:[{title:'지하철',text:''},{title:'버스',text:''},{title:'자가용 · 주차',text:''}],contacts:{groom:'',bride:''},calendar:true,opening:true,galleryLayout:'grid',guestbook:{enabled:true},rsvp:{enabled:false,meal:false,bus:false,busInfo:'',deadline:''},guestPhotos:{enabled:false},couple:{since:'',pledges:[],made:''},party:{type:'birthday'}};}
// 예전 저장본(3등급 시절)에도 새 항목 기본값을 채워 넣습니다.
export function normalize(raw:unknown):Design{const r=(raw||{}) as Partial<Design>;const kind=r.kind==='baby'||r.kind==='couple'||r.kind==='party'?r.kind:'wedding';const accounts=Array.isArray(r.accounts)?r.accounts.map(a=>({...a,side:a.side||(/신부/.test(a.label||'')?'bride':'groom')})):r.accounts;const parsed=schema.safeParse({...r,accounts});if(parsed.success){const d=parsed.data;if(d.kind==='baby'&&d.parents.some(p=>p.label.startsWith('신랑')))d.parents=defaults('baby').parents;return d}return {...defaults(kind),...r,tier:'premium'} as Design}
export function usedAssets(d:Design){return [...d.hero,...d.gallery].map(p=>p.id).concat(isPresetMusic(d.music)?'':d.music,d.video,d.map?.image||'').filter(Boolean)}
