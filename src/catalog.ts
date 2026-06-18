// Canonical catalog loader + types. Source of truth lives in ../data/programs.json (vendored to consumers via sync-catalog).

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
  // In package consumers, this will be resolved relative to the published data/ or the vendored copy.
  // For engine dev: assumes run from affiliate-agent-skills root.
  const fs = require('fs');
  const path = require('path');
  const jsonPath = path.join(__dirname, '..', 'data', 'programs.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
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
