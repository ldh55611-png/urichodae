// Public merchant receiving account only. Never put credentials here.
export const paymentConfig = { bank: '카카오뱅크', holder: '이두형(마플리)', number: '3333-20-2351974', testMode: true };
export const proposedPrice = 14900;
// 실제 사이트(urichodae.com)의 결제 상태입니다.
//  'off'  : 지금처럼 무료 발행 (결제창 없음)
//  'test' : 결제창은 뜨지만 연습 결제 (돈이 나가지 않음)
//  'live' : 실제 결제. 토스페이먼츠 심사 통과 후 Cloudflare에 TOSS_CLIENT_KEY, TOSS_SECRET_KEY(비밀)를 넣고 바꿉니다.
// 미리보기 주소(실제 사이트가 아닌 주소)에서는 항상 'test'로 동작해서, 실제 손님에게 영향 없이 결제 흐름을 시험할 수 있습니다.
// 2026-11-03 토스페이먼츠 심사 기간 동안 'test'(연습 결제창)로 켜 둡니다. 대표 승인.
// ⚠ 'live'로 바꿀 때: 심사 기간에 만든 초대장(entitlement 'unpaid'/'test_paid')은 무료로 유지해야 합니다.
//    D1에서 실행: UPDATE invitations SET entitlement='free_beta' WHERE entitlement IN ('unpaid','test_paid') AND created < '<live 전환 시각>';
export const siteMode: 'off'|'test'|'live' = 'test';
export const productName = '우리의 초대 모바일 초대장 발행';
// 영구보관(기간 없이 계속 열람) 연장 가격. 바꾸려면 이 숫자만 고치면 됩니다.
export const keepPrice = 9900;
export const keepProductName = '우리의 초대 초대장 영구보관';
// 영구보관 판매 여부. 토스페이먼츠 심사 기준(서비스 제공기간 최대 12개월) 때문에 2026-11-03 대표 결정으로 잠시 닫아 둡니다.
// 다시 열려면 true로 바꾸면 결제창·편집 화면·상품 안내·환불 정책에 영구보관이 다시 나타납니다.
export const keepOpen = false;
