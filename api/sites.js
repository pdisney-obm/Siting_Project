import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  if (req.method !== 'GET') return res.status(405).end();

  if (process.env.USE_SITETRACKER === 'true') {
    // TODO: replace with fetchSitesFromSitetracker()
    return res.status(501).json({ error: 'Sitetracker integration not yet implemented' });
  }

  const sitesPath = join(__dirname, '../client/src/data/sites.json');
  res.json(JSON.parse(readFileSync(sitesPath, 'utf-8')));
}
