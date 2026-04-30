import { kv } from '@vercel/kv';
import { createHmac } from 'crypto';
import { getSFConnection } from '../_sitetracker.js';

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

  if (process.env.USE_SITETRACKER_DECISIONS === 'true') {
    try {
      const conn = await getSFConnection();
      const result = await conn.query(
        `SELECT Id FROM sitetracker__Site__c
         WHERE ${process.env.SITETRACKER_SITE_ID_FIELD} = '${siteId}'
         LIMIT 1`
      );
      if (result.records.length === 0) {
        return res.status(404).json({ error: `Site ${siteId} not found in Sitetracker` });
      }
      await conn.sobject('sitetracker__Site__c').update({
        Id: result.records[0].Id,
        [process.env.SITETRACKER_DECISION_FIELD]: decision,
      });
      return res.json({ ok: true });
    } catch (err) {
      console.error('Sitetracker write error:', err);
      return res.status(500).json({ error: 'Failed to write decision to Sitetracker' });
    }
  }

  await kv.hset('decisions', { [siteId]: decision });
  res.json({ ok: true });
}
