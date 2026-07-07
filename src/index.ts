// @agentic-income/engine
// Dispatchable, tested, composed, brand-gated engine for the Agentic Income Network.
// L99 excellence: one catalog powers honest comparisons that rank + monetize recurring payers across hub/spokes/redirector.

export * from './catalog.js';
export * from './affiliate.js';
export * from './audit.js';
export * from './l99-income.js';
export * from './rate-limit.js';
// Deliberately NOT re-exporting ./react/index.js here — that module is client-safe
// (React components, browser fetch calls) while this one uses node:fs for catalog
// loading. Mixing them in one entry poisons the client bundle with a node:fs import
// it can't run. Import react components from '@agentic-income/engine/react.js' instead.

export const VERSION = '0.1.0';
export const DISCLOSURE = 'Some links on this page are affiliate links. If you buy through them, I may earn a commission at no extra cost to you. I only recommend tools I actually use or have tested.';
