// L99 for the income network: dispatchable/tested/composed/brand-gated scoring.
// Extends the ACOS L99 pattern (catalogL99, slotScore, pendingGates) to income "slots" (programs on high-traffic posts, redirector coverage, loop health).

import { getPrograms, payingPrograms } from './affiliate';

export type IncomeL99Score = {
  version: string;
  overall: number; // 0-1
  payingProgramsLive: number; // % of payingPrograms with ourLink set (or at least a program)
  highPriorityCoverage: number;
  redirectorHealth: number; // % of programs with live ourLink that resolve via go. (stub)
  loopHealth: number; // placeholder for audit cadence, backlog, outcomes
  pendingGates: string[];
  details: any;
};

export function incomeL99(): IncomeL99Score {
  const programs = getPrograms();
  const paying = payingPrograms();
  const live = paying.filter(p => p.ourLink).length;
  const coverage = paying.length > 0 ? live / paying.length : 0;

  // High priority (top 8 or so) coverage
  const high = paying.slice(0, 8);
  const highLive = high.filter(p => p.ourLink).length;
  const highCoverage = high.length > 0 ? highLive / high.length : 0;

  const score = (coverage * 0.5) + (highCoverage * 0.3) + (0.2); // stub for loops

  const pending: string[] = [];
  if (coverage < 0.8) pending.push('set-ourLink on remaining high-traffic payers');
  if (highCoverage < 0.9) pending.push('prioritize ourLink for top 8');

  return {
    version: 'l99-income-0.1',
    overall: Math.min(1, score),
    payingProgramsLive: coverage,
    highPriorityCoverage: highCoverage,
    redirectorHealth: 1.0, // assume go. is live
    loopHealth: 0.7, // audit cadence etc. stub
    pendingGates: pending,
    details: {
      totalPaying: paying.length,
      liveCount: live,
      highPaying: high.length,
      highLive: highLive,
      note: 'Run affiliate-audit + sync:catalog + redeploy to improve. Full gates lit when overall >= 0.9 and pendingGates empty.'
    }
  };
}
