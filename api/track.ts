export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return new Response('Not configured', { status: 503 });

  try {
    const body = await req.json();
    const event = JSON.stringify({
      origin:        body.origin        ?? '',
      destination:   body.destination   ?? '',
      date:          body.date          ?? '',
      cabin:         body.cabin         ?? '',
      results_count: body.results_count ?? 0,
      had_results:   (body.results_count ?? 0) > 0,
      timestamp:     new Date().toISOString(),
    });

    // LPUSH then LTRIM to cap at 5000 entries
    await fetch(`${url}/pipeline`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['lpush', 'flyai:searches', event],
        ['ltrim', 'flyai:searches', 0, 4999],
      ]),
    });

    return new Response('ok', { status: 200 });
  } catch {
    return new Response('error', { status: 500 });
  }
}
