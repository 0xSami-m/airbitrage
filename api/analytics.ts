import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const secret = process.env.ANALYTICS_SECRET;

  if (!secret || token !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const raw = (await kv.lrange('flyai:searches', 0, 999)) as string[];
  const events = raw.map(r => {
    try { return JSON.parse(r); } catch { return null; }
  }).filter(Boolean);

  return Response.json(events);
}
