import { loadCatalog, Program, getPrograms } from './catalog';

export const DISCLOSURE = 'Some links on this page are affiliate links. If you buy through them, I may earn a commission at no extra cost to you. I only recommend tools I actually use or have tested.';

export function getLink(tool: string): string | null {
  const p = findProgram(tool);
  return p?.ourLink ?? null;
}

export function findProgram(tool: string): Program | undefined {
  const lower = tool.trim().toLowerCase();
  const programs = getPrograms();
  return programs.find(p =>
    p.tool.toLowerCase() === lower ||
    (p.aliases || []).some((a: string) => a.toLowerCase() === lower)
  );
}

export function payingPrograms(): Program[] {
  return getPrograms().filter((p) => p.hasProgram && p.status !== 'closed' && p.status !== 'dead-end')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function loadFullCatalog() {
  return loadCatalog();
}
