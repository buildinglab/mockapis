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
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Simple API key store for demo purposes
const API_KEYS = new Map<string, { status: 'active' | 'expired' | 'readonly' }>([
  ['demo123', { status: 'active' }],
  ['readonly', { status: 'readonly' }],
  ['expired', { status: 'expired' }]
]);

function validateApiKey(key: string | null): { ok: boolean; code: number; message?: string } {
  if (!key) return { ok: false, code: 401, message: 'Missing apikey' };
  const rec = API_KEYS.get(key);
  if (!rec) return { ok: false, code: 403, message: 'Invalid API key' };
  if (rec.status === 'expired') return { ok: false, code: 403, message: 'API key expired' };
  return { ok: true, code: 200 };
}

function parseIntParam(val: string | null, fallback: number, min = 1, max?: number): number {
  const n = val ? Number.parseInt(val, 10) : fallback;
  if (Number.isNaN(n)) return fallback;
  const clamped = Math.max(min, max ? Math.min(n, max) : n);
  return clamped;
}

export const prerender = false; // ensure this runs at request time

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
  const page = parseIntParam(url.searchParams.get('page'), 1, 1);
  const limit = parseIntParam(url.searchParams.get('limit'), 10000, 1, 10000);

  // Accept API key via query string only: apikey (preferred) or legacy apiKey
  const apiKeyQSNew = url.searchParams.get('apikey');
  const apiKeyQSOld = url.searchParams.get('apiKey');
  const apiKey = apiKeyQSNew ?? apiKeyQSOld;
  const keyCheck = validateApiKey(apiKey);
    if (!keyCheck.ok) {
      return new Response(JSON.stringify({ error: keyCheck.message }), {
        status: keyCheck.code,
        headers: { 'content-type': 'application/json' }
      });
    }

  // Load from the filesystem: /public/generated/nginx/logs/logs_page_{n}.json
  const filePath = join(process.cwd(), 'public', 'generated', 'nginx', 'logs', `logs_page_${page}.json`);
    let data: unknown;
    try {
      const raw = await readFile(filePath, 'utf-8');
      data = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: 'Data file not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Invalid data format' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const total = data.length;
    const sliced = data.slice(0, limit);

    return new Response(
      JSON.stringify({
        data: sliced,
        meta: { page, limit, total }
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
