// Run once: node scripts/geocode.js
// Requires GOOGLE_MAPS_KEY in .env

import 'dotenv/config';
import fs from 'fs';
import https from 'https';

const SITES_PATH = './client/src/data/sites.json';
const API_KEY = process.env.GOOGLE_MAPS_KEY;
const sites = JSON.parse(fs.readFileSync(SITES_PATH, 'utf-8'));

function geocode(address) {
  const query = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.status === 'OK') {
          resolve(json.results[0].geometry.location);
        } else {
          resolve(null);
          console.warn(`  ⚠ Failed: ${address} — ${json.status}`);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const site of sites) {
    if (site.lat && site.lng) {
      console.log(`  ✓ ${site.siteId} already has coordinates, skipping`);
      continue;
    }
    const suffix = site.city === 'longbeach' ? ', Long Beach, CA' : ', Atlanta, GA';
    const query = site.intersection + suffix;
    process.stdout.write(`  Geocoding ${site.siteId}: ${query}... `);
    const loc = await geocode(query);
    if (loc) {
      site.lat = loc.lat;
      site.lng = loc.lng;
      console.log(`${loc.lat}, ${loc.lng}`);
    } else {
      console.log('failed');
    }
    await new Promise(r => setTimeout(r, 150));
  }
  fs.writeFileSync(SITES_PATH, JSON.stringify(sites, null, 2));
  console.log('\nDone. sites.json updated.');
}

run();
