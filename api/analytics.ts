export const config = { runtime: 'edge' };

function parseList(raw: string[]): unknown[] {
  return raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

export default async function handler(req: Request) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return new Response('Not configured', { status: 503 });

  const secret = process.env.ANALYTICS_SECRET;
  if (secret) {
    const reqToken = new URL(req.url).searchParams.get('token');
    if (reqToken !== secret) return new Response('Unauthorized', { status: 401 });
  }

  const [searchRes, bookingRes] = await Promise.all([
    fetch(`${url}/lrange/flyai:searches/0/999`,  { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${url}/lrange/flyai:bookings/0/999`,  { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  const [searchJson, bookingJson] = await Promise.all([
    searchRes.json()  as Promise<{ result: string[] }>,
    bookingRes.json() as Promise<{ result: string[] }>,
  ]);

  return Response.json({
    searches: parseList(searchJson.result  ?? []),
    bookings: parseList(bookingJson.result ?? []),
  });
}
