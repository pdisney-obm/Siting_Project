import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import 'dotenv/config';

const require = createRequire(import.meta.url);
const jsforce = require('jsforce');

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const DECISIONS_PATH = join(__dirname, 'decisions.json');

const tokens = new Set();

// --- Sitetracker connection ---

let sfConnection = null;

async function getSFConnection() {
  if (sfConnection) return sfConnection;
  const conn = new jsforce.Connection({
    loginUrl: process.env.SITETRACKER_INSTANCE_URL,
  });
  await conn.login(
    process.env.SITETRACKER_USERNAME,
    process.env.SITETRACKER_PASSWORD + (process.env.SITETRACKER_SECURITY_TOKEN || '')
  );
  sfConnection = conn;
  return conn;
}

// --- Local decisions helpers ---

function readDecisions() {
  if (!existsSync(DECISIONS_PATH)) return {};
  return JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8'));
}

function writeDecisions(decisions) {
  writeFileSync(DECISIONS_PATH, JSON.stringify(decisions, null, 2));
}

// --- Middleware ---

app.use(express.json());
app.use(express.static(join(__dirname, '../client/dist')));

// --- Routes ---

app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === SITE_PASSWORD) {
    const token = randomUUID();
    tokens.add(token);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/sites', requireAuth, (req, res) => {
  if (process.env.USE_SITETRACKER === 'true') {
    return res.status(501).json({ error: 'Sitetracker sites integration not yet implemented' });
  }
  const sitesPath = join(__dirname, '../client/src/data/sites.json');
  res.json(JSON.parse(readFileSync(sitesPath, 'utf-8')));
});

app.get('/api/decisions', requireAuth, async (req, res) => {
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
  res.json(readDecisions());
});

app.post('/api/decisions/:siteId', requireAuth, async (req, res) => {
  const { siteId } = req.params;
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

  const decisions = readDecisions();
  decisions[siteId] = decision;
  writeDecisions(decisions);
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  const indexPath = join(__dirname, '../client/dist/index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Run "npm run build" first, or use the Vite dev server.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
