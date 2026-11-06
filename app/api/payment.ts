import { env } from 'cloudflare:workers';
import { siteMode,proposedPrice } from '../payment-config';
import { isFreeKind } from '../model';
export type PayMode='off'|'test'|'live';
const productionHosts=['urichodae.com','www.urichodae.com','urichodae.ldh55611.workers.dev'];
// 토스페이먼츠 문서에 공개된 연습용 키입니다. 돈이 오가지 않습니다.
const DOC_TEST_CLIENT='test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm',DOC_TEST_SECRET='test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';
export function payMode(host:string):PayMode{const h=host.split(':')[0].toLowerCase();return productionHosts.includes(h)?siteMode:'test'}
export const hostOf=(req:Request)=>new URL(req.url).host;
export function tossKeys(mode:PayMode){if(mode==='live'){if(!env.TOSS_CLIENT_KEY||!env.TOSS_SECRET_KEY)throw Error('결제 설정이 아직 끝나지 않았습니다.');return {client:env.TOSS_CLIENT_KEY,secret:env.TOSS_SECRET_KEY}}return {client:env.TOSS_TEST_CLIENT_KEY||DOC_TEST_CLIENT,secret:env.TOSS_TEST_SECRET_KEY||DOC_TEST_SECRET}}
export const price=proposedPrice;
// 결제가 필요한 초대장인지: 결제 도입 전에 만든(free_beta) 초대장과 결제 완료(paid) 초대장은 무료로 발행합니다.
// 연습 결제(test_paid)는 연습 모드에서만 결제로 칩니다.
// 커플청첩장·파티 초대장은 사람 모으는 용도라 결제 없이 발행합니다(model.isFreeKind).
export const needsPayment=(mode:PayMode,entitlement:string,kind?:string)=>!isFreeKind(kind)&&mode!=='off'&&!['paid','free_beta',...(mode==='test'?['test_paid']:[])].includes(entitlement);
// 실제 결제를 시작하면 연습 결제로 발행된 초대장은 공개 화면에서 숨깁니다(미리보기 주소에서 연습 결제로 공짜 발행하는 것 방지).
export const publicFilter=()=>siteMode==='live'?" AND (entitlement IN ('paid','free_beta') OR json_extract(data,'$.kind') IN ('couple','party'))":'';
export function requireComplete(d:{kind?:string;names:string;date:string;place:string;address:string;hero:unknown[];couple?:{since?:string}}){if(d.kind==='couple'){if(!d.names.trim()||!d.couple?.since||!d.hero.length)throw Error('두 사람 이름, 사귄 날, 메인 사진을 입력해 주세요.');if(!Number.isFinite(Date.parse(d.couple.since)))throw Error('사귄 날을 확인해 주세요.');return}if(d.kind==='party'){if(!d.names.trim()||!d.date||!d.place.trim())throw Error('주인공 이름, 날짜, 장소를 입력해 주세요.');if(!Number.isFinite(Date.parse(d.date)))throw Error('날짜를 확인해 주세요.');return}if(!d.names.trim()||!d.date||!d.place.trim()||!d.address.trim()||!d.hero.length)throw Error('이름, 날짜, 장소, 주소와 메인 사진을 입력해 주세요.');if(!Number.isFinite(Date.parse(d.date)))throw Error('날짜를 확인해 주세요.')}
