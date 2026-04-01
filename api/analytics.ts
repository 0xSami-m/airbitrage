export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return new Response('Not configured', { status: 503 });

  // Simple secret check — token param must match ANALYTICS_SECRET if set
  const secret = process.env.ANALYTICS_SECRET;
  if (secret) {
    const reqToken = new URL(req.url).searchParams.get('token');
    if (reqToken !== secret) return new Response('Unauthorized', { status: 401 });
  }

  const res = await fetch(`${url}/lrange/flyai:searches/0/999`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json() as { result: string[] };
  const events = (json.result ?? []).map(r => {
    try { return JSON.parse(r); } catch { return null; }
  }).filter(Boolean);

  return Response.json(events);
}
