#!/usr/bin/env node
// Affiliate Ops Agent, Phase 1 — join queue CLI.
// Catalog × relationship registry × publisher facts → ranked, network-grouped application packets.
// No network, no browser, no credentials: it only reads local JSON and writes markdown + JSON.
//
// Usage:
//   npm run build
//   node scripts/affiliate-join-queue.mjs --registry=<registry.json> --publisher=<publisher.json> [--out=<path-prefix>]
//
// --catalog      catalog JSON (default data/programs.json)
// --registry     relationship registry (go-agenticincome data/programs.schema.json shape) — required
// --publisher    publisher facts (see examples/join-queue/publisher.example.json) — required
// --eligibility  program eligibility rules (default data/program-eligibility.json)
// --date         YYYY-MM-DD stamp (default today, UTC)
// --out          write <out>.md and <out>.json; without it the markdown goes to stdout
//
// The registry holds private relationship state. Do not write its queue into a public repo.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.slice(k.length + 3) : d
}
const readJson = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'))

const modulePath = join(ROOT, 'dist', 'src', 'join-queue.js')
if (!existsSync(modulePath)) {
  console.error('dist/src/join-queue.js not found — run `npm run build` first.')
  process.exit(1)
}
const { buildJoinQueue, renderJoinQueueMarkdown } = await import(pathToFileURL(modulePath).href)

const registryPath = arg('registry')
const publisherPath = arg('publisher')
if (!registryPath || !publisherPath) {
  console.error('Usage: node scripts/affiliate-join-queue.mjs --registry=<registry.json> --publisher=<publisher.json> [--out=<prefix>]')
  process.exit(2)
}

const catalog = readJson(arg('catalog', join(ROOT, 'data', 'programs.json')))
const eligibility = readJson(arg('eligibility', join(ROOT, 'data', 'program-eligibility.json'))).rules
const queue = buildJoinQueue({
  catalog,
  registry: readJson(registryPath),
  publisher: readJson(publisherPath),
  eligibility,
  generatedAt: arg('date', new Date().toISOString().slice(0, 10)),
})
const md = renderJoinQueueMarkdown(queue)

const out = arg('out')
if (out) {
  mkdirSync(dirname(resolve(out)), { recursive: true })
  writeFileSync(`${out}.md`, md)
  writeFileSync(`${out}.json`, JSON.stringify(queue, null, 2) + '\n')
  const n = queue.groups.reduce((s, g) => s + g.programs.length, 0)
  console.log(`join queue: ${n} programs in ${queue.groups.length} network groups, ${queue.held.length} held, ${queue.excluded.length} excluded → ${out}.md / .json`)
} else {
  process.stdout.write(md + '\n')
}
