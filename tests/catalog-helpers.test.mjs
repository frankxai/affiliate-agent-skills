import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAffiliateHelpers } from '../dist/react/catalog-helpers.js';

const catalog = {
  disclosure: 'test disclosure text',
  programs: [
    { tool: 'HeyGen', aliases: ['heygen', 'hey gen'], hasProgram: true, priority: 1, status: 'active', ourLink: 'https://go.example/heygen' },
    { tool: 'OpenAI', aliases: ['chatgpt', 'gpt'], hasProgram: false, status: 'dead-end', ourLink: null },
    { tool: 'Jasper', aliases: [], hasProgram: true, priority: 8, status: 'deprioritized', ourLink: null },
    { tool: 'Leonardo', aliases: [], hasProgram: true, priority: 5, status: 'closed', ourLink: null },
  ],
};

test('getLink returns the real URL for a joined program', () => {
  const { getLink } = createAffiliateHelpers(catalog);
  assert.equal(getLink('HeyGen'), 'https://go.example/heygen');
});

test('getLink returns null (never a fabricated link) for a program with no ourLink', () => {
  const { getLink } = createAffiliateHelpers(catalog);
  assert.equal(getLink('OpenAI'), null);
  assert.equal(getLink('Jasper'), null);
});

test('getLink returns null for a tool not in the catalog at all', () => {
  const { getLink } = createAffiliateHelpers(catalog);
  assert.equal(getLink('SomeToolThatDoesNotExist'), null);
});

test('findProgram matches by alias, case-insensitively', () => {
  const { findProgram } = createAffiliateHelpers(catalog);
  assert.equal(findProgram('heygen')?.tool, 'HeyGen');
  assert.equal(findProgram('Hey Gen')?.tool, 'HeyGen');
  assert.equal(findProgram('CHATGPT')?.tool, 'OpenAI');
});

test('findProgram trims whitespace before matching', () => {
  const { findProgram } = createAffiliateHelpers(catalog);
  assert.equal(findProgram('  heygen  ')?.tool, 'HeyGen');
});

test('payingPrograms excludes dead-end and closed programs', () => {
  const { payingPrograms } = createAffiliateHelpers(catalog);
  const names = payingPrograms().map((p) => p.tool);
  assert.ok(!names.includes('OpenAI'), 'dead-end program should be excluded');
  assert.ok(!names.includes('Leonardo'), 'closed program should be excluded');
});

test('payingPrograms includes deprioritized programs (deprioritized != excluded)', () => {
  const { payingPrograms } = createAffiliateHelpers(catalog);
  const names = payingPrograms().map((p) => p.tool);
  assert.ok(names.includes('Jasper'), 'deprioritized still has hasProgram=true and should be listed, just ranked low');
});

test('payingPrograms sorts by priority ascending', () => {
  const { payingPrograms } = createAffiliateHelpers(catalog);
  const priorities = payingPrograms().map((p) => p.priority ?? 99);
  const sorted = [...priorities].sort((a, b) => a - b);
  assert.deepEqual(priorities, sorted);
});

test('DISCLOSURE is passed through from the catalog verbatim', () => {
  const { DISCLOSURE } = createAffiliateHelpers(catalog);
  assert.equal(DISCLOSURE, 'test disclosure text');
});

test('two different catalogs produce independent, non-leaking helpers', () => {
  const catalogB = { disclosure: 'other', programs: [{ tool: 'Only-In-B', hasProgram: true, status: 'active', ourLink: 'https://b.example' }] };
  const helpersA = createAffiliateHelpers(catalog);
  const helpersB = createAffiliateHelpers(catalogB);
  assert.equal(helpersA.getLink('Only-In-B'), null);
  assert.equal(helpersB.getLink('HeyGen'), null);
  assert.equal(helpersB.getLink('Only-In-B'), 'https://b.example');
});
