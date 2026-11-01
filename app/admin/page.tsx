import type { Metadata } from 'next';
import AdminBoard from './board';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'관리자 | 우리의 초대',robots:{index:false,follow:false}};
export default function Admin(){return <AdminBoard/>}
