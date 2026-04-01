import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const event = {
      origin:        body.origin        ?? '',
      destination:   body.destination   ?? '',
      date:          body.date          ?? '',
      cabin:         body.cabin         ?? '',
      results_count: body.results_count ?? 0,
      had_results:   (body.results_count ?? 0) > 0,
      timestamp:     new Date().toISOString(),
    };

    // Store newest-first, cap at 5000 events
    await kv.lpush('flyai:searches', JSON.stringify(event));
    await kv.ltrim('flyai:searches', 0, 4999);

    return new Response('ok', { status: 200 });
  } catch {
    return new Response('error', { status: 500 });
  }
}
