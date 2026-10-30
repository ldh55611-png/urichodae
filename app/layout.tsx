import type { Metadata } from 'next';
import './globals.css';
const title='우리의 초대 | 무료 모바일 청첩장 만들기 · 돌잔치 초대장';
const description='모바일 청첩장과 돌잔치 초대장을 직접 만들어 카카오톡으로 보내세요. 지도·계좌·참석 여부·방명록·배경음악까지, 회원가입 없이 무료 베타로 바로 시작할 수 있어요.';
// 네이버 서치어드바이저, 구글 서치 콘솔에서 받은 사이트 확인 코드(content 값)를 넣습니다.
const naverVerification='';
const googleVerification='';
export const metadata:Metadata={
  metadataBase:new URL('https://urichodae.com'),title,description,icons:{icon:'/favicon.svg'},
  keywords:['모바일 청첩장','모바일 청첩장 만들기','무료 모바일 청첩장','셀프 청첩장','돌잔치 초대장','모바일 돌잔치 초대장','온라인 청첩장','우리의 초대'],
  robots:{index:true,follow:true},
  verification:{...(googleVerification?{google:googleVerification}:{}),...(naverVerification?{other:{'naver-site-verification':naverVerification}}:{})},
  openGraph:{type:'website',locale:'ko_KR',siteName:'우리의 초대',url:'/',title,description,images:[{url:'/og-brand-v1.png',width:1200,height:630,alt:'우리의 초대 — 소중한 날을, 우리답게. 모바일 청첩장 · 돌잔치 초대장'}]},
  twitter:{card:'summary_large_image',title,description,images:['/og-brand-v1.png']}
};
// 검색 결과에 사이트 이름과 서비스 정보를 알려 주는 구조화 데이터
const jsonLd={'@context':'https://schema.org','@graph':[{'@type':'WebSite',name:'우리의 초대',alternateName:'urichodae',url:'https://urichodae.com/',inLanguage:'ko-KR'},{'@type':'WebApplication',name:'우리의 초대',url:'https://urichodae.com/',applicationCategory:'LifestyleApplication',operatingSystem:'Web',description,offers:{'@type':'Offer',price:'0',priceCurrency:'KRW'}}]};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>{children}</body></html>}
