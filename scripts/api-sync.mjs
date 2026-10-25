#!/usr/bin/env node
/**
 * Regenerate the typed API client types from the backend's OpenAPI contract.
 *
 *   pnpm api:sync                       uses ../flinger-backend/openapi/openapi.json
 *   OPENAPI_SOURCE=<path or url> pnpm api:sync
 *
 * Writes src/core/api/openapi.json (a pinned copy) and src/core/api/schema.d.ts (generated types).
 * Both are committed, so API changes show up in pull requests. Never edit them by hand.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source =
  process.env.OPENAPI_SOURCE ?? path.resolve(root, '../flinger-backend/openapi/openapi.json');
const pinned = path.join(root, 'src/core/api/openapi.json');
const types = path.join(root, 'src/core/api/schema.d.ts');

let spec;
if (/^https?:\/\//.test(source)) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not fetch ${source}: ${response.status}`);
  spec = await response.text();
} else {
  spec = readFileSync(source, 'utf8');
}
JSON.parse(spec); // fail early on a broken file
writeFileSync(pinned, spec);

execFileSync(
  path.join(root, 'node_modules/.bin/openapi-typescript'),
  [pinned, '--output', types, '--root-types'],
  { stdio: 'inherit' },
);
console.log(`API types regenerated from ${path.relative(root, source) || source}`);
