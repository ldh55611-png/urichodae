import { reply } from '../service';
import { payMode,hostOf,price } from '../payment';
export async function GET(req:Request){return reply({mode:payMode(hostOf(req)),price})}
