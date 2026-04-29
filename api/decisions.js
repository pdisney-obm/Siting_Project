import { kv } from '@vercel/kv';

async function authenticate(req) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return false;
  return !!(await kv.get(`token:${token}`));
}

export default async function handler(req, res) {
  if (!(await authenticate(req))) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).end();

  const decisions = (await kv.hgetall('decisions')) || {};
  res.json(decisions);
}
