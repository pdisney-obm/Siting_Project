import { createHmac } from 'crypto';

export function computeToken() {
  return createHmac('sha256', process.env.SITE_PASSWORD)
    .update('atl-site-reviewer')
    .digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (password !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ token: computeToken() });
}
