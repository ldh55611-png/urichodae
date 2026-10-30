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
export const schema=z.object({kind:z.enum(['wedding','baby']),tier:z.enum(['standard','deluxe','premium']).transform(()=>'premium' as const),// 어두운 디자인(차콜·아르데코·별빛)은 2026-10-30 폐지 → 예전 저장본은 화이트·순백으로 바꿉니다.
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
 guestPhotos:z.object({enabled:z.boolean().default(false)}).default({})
});
export type Design=z.output<typeof schema>;
export type Invitation={id:string;data:Design;published:boolean;updated:string};
export const defaultAccounts=():Design['accounts']=>[{side:'groom',label:'신랑',bank:'',holder:'',number:''},{side:'groom',label:'신랑 아버님',bank:'',holder:'',number:''},{side:'groom',label:'신랑 어머님',bank:'',holder:'',number:''},{side:'bride',label:'신부',bank:'',holder:'',number:''},{side:'bride',label:'신부 아버님',bank:'',holder:'',number:''},{side:'bride',label:'신부 어머님',bank:'',holder:'',number:''}];
export function defaults(kind:'wedding'|'baby'='wedding'):Design{return {kind,tier:'premium',theme:'sand',style:'classic',title:kind==='wedding'?'우리, 함께하는 시작':'우리 아이의 첫 번째 생일',names:'',date:'',place:'',address:'',message:kind==='wedding'?'서로에게 가장 편안한 쉼이 되어\n이제 같은 길을 걸으려 합니다.\n소중한 날, 따뜻한 마음으로 함께해 주세요.':'작은 웃음으로 찾아온 우리 아이가\n어느새 첫 번째 생일을 맞았습니다.\n소중한 첫걸음을 함께 축하해 주세요.',initials:'',hero:[],gallery:[],music:'',video:'',parents:kind==='wedding'?[{label:'신랑 아버님',name:'',absent:false,phone:''},{label:'신랑 어머님',name:'',absent:false,phone:''},{label:'신부 아버님',name:'',absent:false,phone:''},{label:'신부 어머님',name:'',absent:false,phone:''}]:[{label:'아빠',name:'',absent:false,phone:''},{label:'엄마',name:'',absent:false,phone:''}],accounts:kind==='wedding'?defaultAccounts():[{side:'groom',label:'아빠',bank:'',holder:'',number:''},{side:'groom',label:'엄마',bank:'',holder:'',number:''}],stories:[{date:'',title:'',text:''},{date:'',title:'',text:''},{date:'',title:'',text:''}],letter:'',allowZoom:false,font:'',hall:'',map:{mode:'interactive',image:''},transport:[{title:'지하철',text:''},{title:'버스',text:''},{title:'자가용 · 주차',text:''}],contacts:{groom:'',bride:''},calendar:true,opening:true,galleryLayout:'grid',guestbook:{enabled:true},rsvp:{enabled:false,meal:false,bus:false,busInfo:'',deadline:''},guestPhotos:{enabled:false}};}
// 예전 저장본(3등급 시절)에도 새 항목 기본값을 채워 넣습니다.
export function normalize(raw:unknown):Design{const r=(raw||{}) as Partial<Design>;const kind=r.kind==='baby'?'baby':'wedding';const accounts=Array.isArray(r.accounts)?r.accounts.map(a=>({...a,side:a.side||(/신부/.test(a.label||'')?'bride':'groom')})):r.accounts;const parsed=schema.safeParse({...r,accounts});if(parsed.success){const d=parsed.data;if(d.kind==='baby'&&d.parents.some(p=>p.label.startsWith('신랑')))d.parents=defaults('baby').parents;return d}return {...defaults(kind),...r,tier:'premium'} as Design}
export function usedAssets(d:Design){return [...d.hero,...d.gallery].map(p=>p.id).concat(isPresetMusic(d.music)?'':d.music,d.video,d.map?.image||'').filter(Boolean)}
