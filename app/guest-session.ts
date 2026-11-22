import { cookies,headers } from 'next/headers';
import { env } from 'cloudflare:workers';
const COOKIE='oi_guest';
const tokenValid=(value:string)=>/^[a-f0-9]{64}$/.test(value);
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
// 관리키는 쿠키로 확인하고, 쿠키를 저장하지 않는 브라우저(카톡 안 브라우저 등)는 화면이 보내는 x-oi-key 헤더로 확인합니다.
export const KEY_HEADER='x-oi-key';
async function ownerOf(key:string|undefined|null){if(!key||!tokenValid(key))return null;const row=await env.DB!.prepare('SELECT owner FROM guest_sessions WHERE token_hash=?').bind(await hash(key)).first<{owner:string}>();return row?{owner:row.owner,key}:null}
export async function guest(){const fromCookie=await ownerOf((await cookies()).get(COOKIE)?.value);if(fromCookie)return fromCookie;let fromHeader:string|null=null;try{fromHeader=(await headers()).get(KEY_HEADER)}catch{}return ownerOf(fromHeader)}
// 자체 Cloudflare 배포에서는 ChatGPT 로그인 헤더를 믿지 않습니다(누구나 위조 가능). 관리키 쿠키로만 주인을 확인합니다.
export async function currentOwner(){return (await guest())?.owner||null}
async function setKey(key:string,req:Request){(await cookies()).set(COOKIE,key,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'lax',path:'/',maxAge:180*24*60*60})}
// 새로 만든 관리키는 key로 돌려줘서 화면이 브라우저에도 따로 보관하게 합니다.
export async function ensureOwner(req:Request):Promise<{owner:string;key?:string}>{const owner=await currentOwner();if(owner)return {owner};const key=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');const id='guest:'+crypto.randomUUID();await env.DB!.prepare('INSERT INTO guest_sessions(token_hash,owner,created) VALUES(?,?,?)').bind(await hash(key),id,new Date().toISOString()).run();await setKey(key,req);return {owner:id,key}}
export async function recover(key:string,req:Request){if(!tokenValid(key))throw Error('관리키를 확인해 주세요.');const row=await env.DB!.prepare('SELECT owner FROM guest_sessions WHERE token_hash=?').bind(await hash(key)).first();if(!row)throw Error('관리키를 확인해 주세요.');await setKey(key,req)}
