#!/usr/bin/env node
/**
 * Traceability gate:
 * 1. Every REQ-ID in SRS must appear in the traceability matrix.
 * 2. Every endpoint (method + path) in OpenAPI must have at least one REQ reference in the matrix.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SRS_PATH = path.join(ROOT, 'docs/02-requirements/srs.md');
const MATRIX_PATH = path.join(ROOT, 'docs/10-traceability/traceability-matrix.md');
const OPENAPI_PATH = path.join(ROOT, 'docs/04-api/openapi.yaml');

function readFile(p) {
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
  return fs.readFileSync(p, 'utf8');
}

function extractReqIdsFromSrs(content) {
  const re = /REQ-[A-Z]+-\d+/g;
  const set = new Set();
  let m;
  while ((m = re.exec(content)) !== null) set.add(m[0]);
  return set;
}

function normalizePath(p) {
  let s = p.replace(/\{id\}/g, ':id').replace(/\{jobId\}/g, ':jobId');
  const q = s.indexOf('?');
  if (q !== -1) s = s.slice(0, q);
  return s;
}

function endpointKey(method, path) {
  return `${method.toLowerCase()} ${normalizePath(path)}`;
}

function parseMatrix(content) {
  const reqIds = new Set();
  const coveredEndpoints = new Set(); // 'METHOD /path' normalized
  let hasAllProtected = false;
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('|') || line.includes('---')) continue;
    const cols = line.split('|').map((c) => c.trim());
    if (cols.length < 4) continue;
    const reqId = cols[1];
    if (!/^REQ-[A-Z]+-\d+$/.test(reqId)) continue;
    reqIds.add(reqId);
    const endpointCol = cols[3] || '';
    if (/alle\s+beskyttede|all\s+protected/i.test(endpointCol)) {
      hasAllProtected = true;
      continue;
    }
    // Parse "POST /auth/register, GET /me" or "GET/POST /vehicle-profiles"
    const parts = endpointCol.split(',').map((s) => s.trim());
    for (const part of parts) {
      const slash = part.indexOf('/');
      if (slash === -1) continue;
      const methodPart = part.slice(0, slash).trim();
      const pathPart = part.slice(slash).trim().replace(/\s+/g, ' ');
      const pathOnly = (pathPart.split(' ')[0] || pathPart).trim();
      const pathNorm = normalizePath(pathOnly);
      const methods = methodPart.split('/').map((m) => m.trim().toLowerCase());
      for (const method of methods) {
        if (['get', 'post', 'patch', 'delete', 'put'].includes(method)) {
          coveredEndpoints.add(`${method} ${pathNorm}`);
        }
      }
    }
  }
  return { reqIds, coveredEndpoints, hasAllProtected };
}

function extractOpenApiEndpoints(content) {
  const endpoints = []; // { method, path, protected }
  const pathRe = /^  (\/(?:[a-z0-9{}_-]+\/?)+):\s*$/gm;
  const methodRe = /^    (get|post|patch|delete|put):\s*$/gm;
  let currentPath = null;
  let inPaths = false;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('paths:')) {
      inPaths = true;
      continue;
    }
    if (inPaths && line.match(/^  \/[a-z0-9/{}-]+:\s*$/)) {
      currentPath = line.replace(/:\s*$/, '').trim();
      continue;
    }
    if (currentPath && line.match(/^    (get|post|patch|delete|put):\s*$/)) {
      const method = line.match(/(get|post|patch|delete|put)/)[1].toLowerCase();
      let protected_ = true;
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const t = lines[j].trim();
        if (t.startsWith('security:') && !t.includes('bearerAuth') && /\[\s*\]/.test(t)) {
          protected_ = false;
          break;
        }
        if (t.startsWith('security:') && t.includes('bearerAuth')) break;
        if (t.startsWith('requestBody:') || t.startsWith('responses:')) break;
      }
      endpoints.push({ method, path: currentPath, protected: protected_ });
      continue;
    }
    if (inPaths && line.trim() && !line.startsWith(' ') && !line.startsWith('#')) {
      currentPath = null;
    }
  }
  return endpoints;
}

// Main
const srsContent = readFile(SRS_PATH);
const matrixContent = readFile(MATRIX_PATH);
const openapiContent = readFile(OPENAPI_PATH);

const srsReqIds = extractReqIdsFromSrs(srsContent);
const { reqIds: matrixReqIds, coveredEndpoints, hasAllProtected } = parseMatrix(matrixContent);
const openapiEndpoints = extractOpenApiEndpoints(openapiContent);

let failed = false;

// 1) Every SRS REQ must be in matrix
const missingInMatrix = [...srsReqIds].filter((id) => !matrixReqIds.has(id));
if (missingInMatrix.length > 0) {
  console.error('Traceability FAIL: REQ-IDs in SRS but not in matrix:', missingInMatrix.join(', '));
  failed = true;
}

// 2) Every OpenAPI endpoint must be covered
const normalizedCovered = new Set([...coveredEndpoints].map((k) => k.toLowerCase()));
for (const { method, path: p, protected: isProtected } of openapiEndpoints) {
  const key = endpointKey(method, p);
  if (normalizedCovered.has(key)) continue;
  if (isProtected && hasAllProtected) continue;
  console.error('Traceability FAIL: OpenAPI endpoint without REQ reference:', key);
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Traceability OK: SRS REQ-IDs in matrix, all OpenAPI endpoints covered.');
process.exit(0);
