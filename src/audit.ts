// Thin wrapper / pure helpers for affiliate-audit. The heavy logic lives in scripts/affiliate-audit.mjs for now (portable).
// Future: move pure functions here for the package.

export type AuditInput = {
  catalog: any;
  sites: Record<string, { posts: any[] }>;
  traffic?: any;
};

export function computeGaps(input: AuditInput) {
  // Placeholder – the real audit script does the heavy lifting (catalog x content x traffic).
  // This makes the engine "dispatchable" for agents.
  const gaps: any[] = [];
  // In real use, agents call the script or this after loading.
  return { gaps, summary: 'See scripts/affiliate-audit.mjs for full implementation and rules.' };
}
