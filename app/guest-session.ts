import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from './chatgpt-auth';
const COOKIE='oi_guest';
const tokenValid=(value:string)=>/^[a-f0-9]{64}$/.test(value);
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function guest(){const key=(await cookies()).get(COOKIE)?.value;if(!key||!tokenValid(key))return null;const row=await env.DB!.prepare('SELECT owner FROM guest_sessions WHERE token_hash=?').bind(await hash(key)).first<{owner:string}>();return row?{owner:row.owner,key}:null}
export async function currentOwner(){const g=await guest();if(g)return g.owner;return (await getChatGPTUser())?.userId||null}
async function setKey(key:string,req:Request){(await cookies()).set(COOKIE,key,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'lax',path:'/',maxAge:180*24*60*60})}
export async function ensureOwner(req:Request){const owner=await currentOwner();if(owner)return owner;const key=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');const id='guest:'+crypto.randomUUID();await env.DB!.prepare('INSERT INTO guest_sessions(token_hash,owner,created) VALUES(?,?,?)').bind(await hash(key),id,new Date().toISOString()).run();await setKey(key,req);return id}
export async function recover(key:string,req:Request){if(!tokenValid(key))throw Error('관리키를 확인해 주세요.');const row=await env.DB!.prepare('SELECT owner FROM guest_sessions WHERE token_hash=?').bind(await hash(key)).first();if(!row)throw Error('관리키를 확인해 주세요.');await setKey(key,req)}
