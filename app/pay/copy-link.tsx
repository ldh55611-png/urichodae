'use client';
import { useState } from 'react';
export default function CopyLink({url}:{url:string}){const [done,setDone]=useState(false);return <div className="pay-link"><input readOnly value={url} onFocus={e=>e.target.select()}/><button className="outline" onClick={async()=>{try{await navigator.clipboard.writeText(url);setDone(true)}catch{}}}>{done?'복사했어요':'주소 복사'}</button></div>}
