import type { Metadata } from 'next';
import Studio from './studio';
import { recordVisit } from './visit';
export const dynamic='force-dynamic';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default async function Home(){await recordVisit('home');return <Studio/>}
