import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const DECISIONS_PATH = join(__dirname, 'decisions.json');

const tokens = new Set();

app.use(express.json());
app.use(express.static(join(__dirname, '../client/dist')));

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
    // TODO: replace with fetchSitesFromSitetracker()
    return res.status(501).json({ error: 'Sitetracker integration not yet implemented' });
  }
  const sitesPath = join(__dirname, '../client/src/data/sites.json');
  res.json(JSON.parse(readFileSync(sitesPath, 'utf-8')));
});

app.get('/api/decisions', requireAuth, (req, res) => {
  if (!existsSync(DECISIONS_PATH)) return res.json({});
  res.json(JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8')));
});

app.post('/api/decisions/:siteId', requireAuth, (req, res) => {
  const { decision } = req.body;
  const { siteId } = req.params;
  const decisions = existsSync(DECISIONS_PATH)
    ? JSON.parse(readFileSync(DECISIONS_PATH, 'utf-8'))
    : {};
  decisions[siteId] = decision;
  writeFileSync(DECISIONS_PATH, JSON.stringify(decisions, null, 2));
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
