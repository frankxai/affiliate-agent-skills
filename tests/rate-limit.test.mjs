import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, clientKeyFromHeaders } from '../dist/rate-limit.js';

test('allows requests under the limit', () => {
  const key = `test-under-${Math.random()}`;
  for (let i = 0; i < 5; i++) {
    const result = checkRateLimit(key, 5, 60_000);
    assert.equal(result.allowed, true, `request ${i} should be allowed`);
  }
});

test('blocks the request that exceeds the limit', () => {
  const key = `test-over-${Math.random()}`;
  for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 60_000);
  const sixth = checkRateLimit(key, 5, 60_000);
  assert.equal(sixth.allowed, false);
  assert.equal(sixth.remaining, 0);
});

test('remaining count decreases correctly as requests are used', () => {
  const key = `test-remaining-${Math.random()}`;
  const first = checkRateLimit(key, 3, 60_000);
  const second = checkRateLimit(key, 3, 60_000);
  assert.equal(first.remaining, 2);
  assert.equal(second.remaining, 1);
});

test('a request outside the time window is not counted against the limit', async () => {
  const key = `test-window-${Math.random()}`;
  const result = checkRateLimit(key, 1, 20);
  assert.equal(result.allowed, true);
  await new Promise((r) => setTimeout(r, 30));
  const afterWindow = checkRateLimit(key, 1, 20);
  assert.equal(afterWindow.allowed, true, 'window should have expired, allowing a fresh request');
});

test('different keys have independent limits', () => {
  const keyA = `test-independent-a-${Math.random()}`;
  const keyB = `test-independent-b-${Math.random()}`;
  checkRateLimit(keyA, 1, 60_000);
  const blockedA = checkRateLimit(keyA, 1, 60_000);
  const allowedB = checkRateLimit(keyB, 1, 60_000);
  assert.equal(blockedA.allowed, false);
  assert.equal(allowedB.allowed, true);
});

test('clientKeyFromHeaders extracts the first IP from x-forwarded-for', () => {
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18, 150.172.238.178' });
  assert.equal(clientKeyFromHeaders(headers, 'checkout'), 'checkout:203.0.113.5');
});

test('clientKeyFromHeaders falls back to "unknown" with no header', () => {
  const headers = new Headers();
  assert.equal(clientKeyFromHeaders(headers, 'subscribe'), 'subscribe:unknown');
});

test('clientKeyFromHeaders namespaces by route so the same IP on different routes gets independent limits', () => {
  const headers = new Headers({ 'x-forwarded-for': '198.51.100.1' });
  const keyA = clientKeyFromHeaders(headers, 'checkout');
  const keyB = clientKeyFromHeaders(headers, 'subscribe');
  assert.notEqual(keyA, keyB);
});
