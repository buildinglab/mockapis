/*
Copyright 2025 G Vaishno Chaitanya

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/*
  Build script to generate mock NGINX logs into public/generated/nginx/logs.
  - Uses @faker-js/faker
  - Produces files named logs_page_{n}.json
  - Each file contains ~20 entries with fields:
    agent, client, compression, referer, request, size, status, timestamp, user
*/

import { faker } from '@faker-js/faker';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// --- Config ---
const OUT_DIR = join(process.cwd(), 'public', 'generated', 'nginx', 'logs');
// Defaults: 20 pages x 10,000 entries = 200,000 total
const PAGES = Number(process.env.PAGES || 20); // how many pages to generate
const ENTRIES_PER_FILE = Number(process.env.ENTRIES || 10000); // ~10,000 per file

export type LogEntry = {
  agent: string;
  client: string;
  compression: string; // e.g. "gzip" or "-"
  referer: string;
  request: string; // e.g. "GET /index.html HTTP/1.1"
  size: number; // bytes
  status: number; // HTTP status code
  timestamp: string; // ISO string
  user: string; // user or "-"
};

function randomCompression(): string {
  return faker.helpers.arrayElement(['gzip', 'br', '-']);
}

function randomRequest(): string {
  const method = faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']);
  const path = faker.helpers.arrayElement([
    '/', '/index.html', '/api', '/health', '/static/app.js', '/images/logo.png'
  ]);
  const proto = faker.helpers.arrayElement(['HTTP/1.1', 'HTTP/2']);
  return `${method} ${path} ${proto}`;
}

function makeEntry(): LogEntry {
  return {
    agent: faker.internet.userAgent(),
    client: faker.internet.ipv4(),
    compression: randomCompression(),
    referer: faker.helpers.arrayElement([
      '-',
      faker.internet.url(),
      faker.internet.url() + '/page'
    ]),
    request: randomRequest(),
    size: faker.number.int({ min: 200, max: 50000 }),
    status: faker.helpers.arrayElement([200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503]),
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    user: faker.helpers.arrayElement(['-', faker.internet.username()])
  };
}

function ensureOutDir() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
}

function writePage(page: number) {
  const items: LogEntry[] = Array.from({ length: ENTRIES_PER_FILE }, () => makeEntry());
  const filePath = join(OUT_DIR, `logs_page_${page}.json`);
  // Minified to reduce file size for static hosting
  writeFileSync(filePath, JSON.stringify(items), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${items.length} logs -> ${filePath}`);
}

function main() {
  ensureOutDir();
  for (let p = 1; p <= PAGES; p++) {
    writePage(p);
  }
}

main();
