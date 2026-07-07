// Canonical catalog loader + types. Source of truth lives in ../data/programs.json (vendored to consumers via sync-catalog).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export type Program = {
  tool: string;
  category?: string;
  aliases?: string[];
  hasProgram: boolean;
  priority?: number;
  commission?: string;
  recurring?: string;
  cookieDays?: number | null;
  network?: string;
  signupUrl?: string;
  ourLink?: string | null;
  status?: string;
  note?: string;
};

export type Catalog = {
  _comment?: string;
  updatedAt: string;
  disclosure: string;
  programs: Program[];
};

let cachedCatalog: Catalog | null = null;

export function loadCatalog(force = false): Catalog {
  if (cachedCatalog && !force) return cachedCatalog;
  // Resolved relative to this module's own location, so it works identically whether
  // running from the engine repo directly or from inside a consumer's node_modules —
  // the package's data/ ships alongside dist/ per package.json's "files" field.
  const here = dirname(fileURLToPath(import.meta.url));
  const jsonPath = join(here, '..', 'data', 'programs.json');
  const raw = readFileSync(jsonPath, 'utf8');
  cachedCatalog = JSON.parse(raw) as Catalog;
  return cachedCatalog;
}

export function getPrograms(): Program[] {
  return loadCatalog().programs;
}

export function findProgramBySlugOrAlias(slug: string): Program | undefined {
  const lower = slug.toLowerCase().trim();
  return getPrograms().find(p =>
    p.tool.toLowerCase() === lower ||
    (p.aliases || []).some(a => a.toLowerCase() === lower)
  );
}
