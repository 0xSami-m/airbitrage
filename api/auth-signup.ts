export const config = { maxDuration: 15 };

const BACKEND = process.env.BACKEND_URL ?? 'https://api.airbitrage.io';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const upstream = await fetch(`${BACKEND}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(10000),
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
}
