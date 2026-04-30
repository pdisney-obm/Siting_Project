import { kv } from '@vercel/kv';
import { createHmac } from 'crypto';
import { getSFConnection } from './_sitetracker.js';

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

  if (process.env.USE_SITETRACKER_DECISIONS === 'true') {
    try {
      const conn = await getSFConnection();
      const result = await conn.query(
        `SELECT ${process.env.SITETRACKER_SITE_ID_FIELD}, ${process.env.SITETRACKER_DECISION_FIELD}
         FROM sitetracker__Site__c
         WHERE ${process.env.SITETRACKER_DECISION_FIELD} != null`
      );
      const decisions = {};
      result.records.forEach(record => {
        decisions[record[process.env.SITETRACKER_SITE_ID_FIELD]] =
          record[process.env.SITETRACKER_DECISION_FIELD];
      });
      return res.json(decisions);
    } catch (err) {
      console.error('Sitetracker read error:', err);
      return res.status(500).json({ error: 'Failed to read decisions from Sitetracker' });
    }
  }

  const decisions = (await kv.hgetall('decisions')) || {};
  res.json(decisions);
}
