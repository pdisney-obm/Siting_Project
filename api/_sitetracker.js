import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const jsforce = require('jsforce');

let sfConnection = null;

export async function getSFConnection() {
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
