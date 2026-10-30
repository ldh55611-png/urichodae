import { env } from 'cloudflare:workers';
import { notFound } from 'next/navigation';
import InvitationView from '../../invitation-view';
import type { Design } from '../../model';
export const dynamic='force-dynamic';
export default async function Invite({params}:{params:Promise<{id:string}>}){const {id}=await params;const row=await env.DB?.prepare('SELECT data FROM invitations WHERE id=? AND published=1').bind(id).first<{data:string}>();if(!row)notFound();return <div className="public-invite"><InvitationView data={JSON.parse(row.data) as Design}/></div>}
