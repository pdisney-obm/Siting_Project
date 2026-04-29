import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (password !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = randomUUID();
  await kv.set(`token:${token}`, '1', { ex: 60 * 60 * 24 }); // 24h expiry
  res.json({ token });
}
