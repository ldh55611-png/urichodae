import { reply } from '../service';
import { payMode,hostOf,price } from '../payment';
import { keepPrice } from '../../payment-config';
export async function GET(req:Request){return reply({mode:payMode(hostOf(req)),price,keepPrice})}
