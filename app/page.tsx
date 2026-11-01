import type { Metadata } from 'next';
import Studio from './studio';
import { recordVisit } from './visit';
import MetaPixel from './meta-pixel';
export const dynamic='force-dynamic';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default async function Home(){await recordVisit('home');return <><MetaPixel/><Studio/></>}
