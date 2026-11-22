'use client';
// 카톡 안 브라우저처럼 쿠키를 잘 저장하지 않는 브라우저에서도 '내 초대장 주인'을 잃지 않도록,
// 관리키를 이 브라우저(localStorage)에도 보관하고 우리 사이트 /api 요청마다 x-oi-key 헤더로 함께 보냅니다.
const STORE='oi_key',HEADER='x-oi-key',valid=(k:unknown):k is string=>typeof k==='string'&&/^[a-f0-9]{64}$/.test(k);
export function saveOwnerKey(key:unknown){if(!valid(key))return;try{localStorage.setItem(STORE,key)}catch{}}
function storedKey(){try{const k=localStorage.getItem(STORE);return valid(k)?k:null}catch{return null}}
let installed=false;
export function installOwnerKey(){
  if(installed||typeof window==='undefined')return;installed=true;
  const original=window.fetch.bind(window);
  window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
    const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return original(input,init);
    const key=storedKey();let next=init;
    if(key){const h=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));if(!h.has(HEADER))h.set(HEADER,key);next={...init,headers:h}}
    const res=await original(input,next);
    saveOwnerKey(res.headers.get(HEADER));
    // 관리키로 복구했으면 그 키를 보관합니다.
    if(res.ok&&url.pathname==='/api/session'&&(next?.method||'GET').toUpperCase()==='POST'&&typeof next?.body==='string'){try{saveOwnerKey((JSON.parse(next.body) as {key?:string}).key?.trim())}catch{}}
    return res};
  // 쿠키가 살아 있는 브라우저는 지금 관리키를 미리 보관해 둡니다(나중에 쿠키가 지워져도 이어서 만들 수 있게).
  window.fetch('/api/session').then(r=>r.ok?r.json() as Promise<{key?:string}>:null).then(j=>saveOwnerKey(j?.key)).catch(()=>{});
}
