import type { Metadata } from 'next';
import Studio from './studio';
export const dynamic='force-dynamic';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default function Home(){return <Studio/>}
