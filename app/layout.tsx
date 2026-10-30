import type { Metadata } from 'next';
import './globals.css';
const title='우리의 초대 | 소중한 날을, 우리답게';
const description='사진과 마음을 담아 만드는 모바일 청첩장·돌잔치 초대장. 지금은 무료 베타, 로그인 없이 시작하세요.';
export const metadata:Metadata={
  metadataBase:new URL('https://urichodae.com'),title,description,icons:{icon:'/favicon.svg'},
  openGraph:{type:'website',locale:'ko_KR',siteName:'우리의 초대',title,description,images:[{url:'/og-brand-v1.png',width:1200,height:630,alt:'우리의 초대 — 소중한 날을, 우리답게. 모바일 청첩장 · 돌잔치 초대장'}]},
  twitter:{card:'summary_large_image',title,description,images:['/og-brand-v1.png']}
};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
