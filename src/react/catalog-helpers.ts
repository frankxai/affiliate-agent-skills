// Pure catalog-lookup logic — deliberately its own file with no 'use client' directive
// and no React import, so consumers that only need lookup logic (e.g. a site's
// lib/affiliate.ts, used across server components, static generation, and metadata
// functions) don't pull the client-component bundle in transitively.
import type { Program, Catalog } from '../catalog.js';

export type { Program, Catalog };

/**
 * Parameterized by the caller's own catalog — no fixed import path, no assumption about
 * where a consumer's data/programs.json lives. Each site's lib/affiliate.ts calls this once
 * with its own vendored catalog and re-exports the result, so every existing
 * `import { getLink } from '@/lib/affiliate'` call site keeps working unchanged; only the
 * implementation behind it is now shared.
 */
export function createAffiliateHelpers(catalog: Catalog) {
  const byAlias = new Map<string, Program>();
  for (const p of catalog.programs) {
    byAlias.set(p.tool.toLowerCase(), p);
    for (const a of p.aliases ?? []) byAlias.set(a.toLowerCase(), p);
  }

  function findProgram(tool: string): Program | undefined {
    return byAlias.get(tool.trim().toLowerCase());
  }

  function getLink(tool: string): string | null {
    return findProgram(tool)?.ourLink ?? null;
  }

  function payingPrograms(): Program[] {
    return catalog.programs
      .filter((p) => p.hasProgram && p.status !== 'closed' && p.status !== 'dead-end')
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  }

  return { DISCLOSURE: catalog.disclosure, findProgram, getLink, payingPrograms };
}
