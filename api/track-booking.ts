export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return new Response('Not configured', { status: 503 });

  try {
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            ?? req.headers.get('x-real-ip')
            ?? 'unknown';

    const event = JSON.stringify({
      ...body,
      ip,
      timestamp: new Date().toISOString(),
    });

    await fetch(`${url}/pipeline`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['lpush', 'flyai:bookings', event],
        ['ltrim', 'flyai:bookings', 0, 4999],
      ]),
    });

    return new Response('ok', { status: 200 });
  } catch {
    return new Response('error', { status: 500 });
  }
}
