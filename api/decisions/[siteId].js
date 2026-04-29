import { kv } from '@vercel/kv';
import { createHmac } from 'crypto';

function authenticate(req) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const expected = createHmac('sha256', process.env.SITE_PASSWORD)
    .update('atl-site-reviewer')
    .digest('hex');
  return token === expected;
}

export default async function handler(req, res) {
  if (!authenticate(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { siteId } = req.query;
  const { decision } = req.body;
  await kv.hset('decisions', { [siteId]: decision });
  res.json({ ok: true });
}
