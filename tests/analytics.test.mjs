import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnalyticsEvent, ALLOWED_EVENTS } from '../dist/react/analytics.js';

test('accepts a valid, allow-listed event', () => {
  const result = normalizeAnalyticsEvent({ event: 'affiliate_click', tool: 'HeyGen', source: 'content-affiliate-link' });
  assert.ok(result);
  assert.equal(result.event, 'affiliate_click');
  assert.equal(result.tool, 'HeyGen');
});

test('rejects an event not on the allow-list — this is the actual security boundary', () => {
  const result = normalizeAnalyticsEvent({ event: 'anything_i_want', tool: 'x' });
  assert.equal(result, null);
});

test('rejects non-object input', () => {
  assert.equal(normalizeAnalyticsEvent(null), null);
  assert.equal(normalizeAnalyticsEvent('affiliate_click'), null);
  assert.equal(normalizeAnalyticsEvent(42), null);
  assert.equal(normalizeAnalyticsEvent(undefined), null);
});

test('rejects missing event field', () => {
  assert.equal(normalizeAnalyticsEvent({ tool: 'HeyGen' }), null);
});

test('truncates overlong string fields instead of accepting unbounded input', () => {
  const longString = 'x'.repeat(1000);
  const result = normalizeAnalyticsEvent({ event: 'affiliate_click', tool: longString });
  assert.ok(result);
  assert.ok(result.tool.length <= 240, 'field should be capped at 240 chars');
});

test('drops non-string values on optional fields rather than passing them through', () => {
  const result = normalizeAnalyticsEvent({ event: 'affiliate_click', tool: 12345, source: { nested: true } });
  assert.ok(result);
  assert.equal(result.tool, undefined);
  assert.equal(result.source, undefined);
});

test('fills in a timestamp when none is provided', () => {
  const result = normalizeAnalyticsEvent({ event: 'affiliate_click' });
  assert.ok(result.ts);
  assert.ok(!Number.isNaN(new Date(result.ts).getTime()));
});

test('every event name actually used across the network is on the allow-list', () => {
  // Guards against the allow-list and the actual call sites drifting apart silently.
  const usedElsewhere = [
    'affiliate_click', 'checkout_click', 'checkout_redirect', 'checkout_fallback_request',
    'delivery_view', 'offer_view', 'subscribe_success', 'subscribe_error',
    'comparison_criteria_opened', 'disclosure_seen', 'affiliate_route_clicked',
    'owned_offer_clicked', 'unpaid_route_clicked', 'null_link_rendered',
    'stale_route_seen', 'last_verified_visible', 'trust_standard_clicked',
  ];
  for (const event of usedElsewhere) {
    assert.ok(ALLOWED_EVENTS.has(event), `"${event}" is used in site code but missing from ALLOWED_EVENTS`);
  }
});
