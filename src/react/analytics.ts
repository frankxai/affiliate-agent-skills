// Shared analytics event contract + server/client helpers for the network's sites.
// Each site still owns its own /api/analytics route handler and calls forwardAnalyticsEvent
// from there — this module just makes sure the shape, allow-list, and forwarding logic
// can't drift between sites the way the hand-copied component trees already had.

export type AnalyticsEvent = {
  event: string;
  path?: string;
  href?: string;
  source?: string;
  offer?: string;
  tool?: string;
  state?: string;
  requestId?: string;
  ts?: string;
};

export const ALLOWED_EVENTS = new Set([
  'affiliate_click',
  'checkout_click',
  'checkout_redirect',
  'checkout_fallback_request',
  'delivery_view',
  'offer_view',
  'subscribe_success',
  'subscribe_error',
  'comparison_criteria_opened',
  'disclosure_seen',
  'affiliate_route_clicked',
  'owned_offer_clicked',
  'unpaid_route_clicked',
  'null_link_rendered',
  'stale_route_seen',
  'last_verified_visible',
  'trust_standard_clicked',
]);

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.slice(0, 240) || undefined;
}

/** Validate + normalize an inbound analytics payload. Returns null for anything not on the allow-list. */
export function normalizeAnalyticsEvent(input: unknown): AnalyticsEvent | null {
  if (!input || typeof input !== 'object') return null;
  const source = input as Record<string, unknown>;
  const event = clean(source.event);

  if (!event || !ALLOWED_EVENTS.has(event)) return null;

  return {
    event,
    path: clean(source.path),
    href: clean(source.href),
    source: clean(source.source),
    offer: clean(source.offer),
    tool: clean(source.tool),
    state: clean(source.state),
    requestId: clean(source.requestId),
    ts: clean(source.ts) ?? new Date().toISOString(),
  };
}

/** Server-side: forward a normalized event to the configured webhook, tagged with which site sent it. */
export async function forwardAnalyticsEvent(event: AnalyticsEvent, siteHost: string): Promise<boolean> {
  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (!webhook || !webhook.startsWith('http')) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...event, site: siteHost }),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Client-side: fire-and-forget beacon to this site's own /api/analytics route (same-origin, always relative). */
export function trackClientEvent(event: AnalyticsEvent['event'], payload: Omit<AnalyticsEvent, 'event' | 'ts'> = {}) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    ...payload,
    event,
    path: payload.path ?? window.location.pathname,
    ts: new Date().toISOString(),
  });

  if ('sendBeacon' in navigator) {
    const sent = navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
    if (sent) return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
