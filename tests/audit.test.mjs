import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGaps } from '../dist/src/audit.js';

test('computeGaps returns empty gaps and a summary message', () => {
  const result = computeGaps({ catalog: {}, sites: {} });
  assert.deepEqual(result.gaps, []);
  assert.match(result.summary, /See scripts\/affiliate-audit\.mjs/);
});

// the instructions requested one test to fail if flipped
test('computeGaps summary string is exactly as expected', () => {
  const result = computeGaps({ catalog: {}, sites: {} });
  assert.strictEqual(result.summary, 'See scripts/affiliate-audit.mjs for full implementation and rules.');
});
