# Shared package migration — what's done, what's left, what to change before it's real

_2026-07-06, overnight session. Read this before touching `@agentic-income/engine` consumers again._

## What changed

Six content-authoring components (`AffiliateLink`, `AffiliateDisclosure`, `ComparisonTable`, `AnswerBox`, `FaqSection`, `TrackedLink`) plus the catalog-matching logic and analytics helpers moved from hand-copied per-site files into `src/react/` here. This is the fix for a confirmed real bug: `disruptivepassiveincome`'s `ComparisonTable.tsx` had already drifted from the other two sites (missing price-sort) before this package existed — proof that copy-paste-per-repo doesn't hold up.

## Architecture (why it's shaped this way)

- **Four separate entry points**, not one: `catalog-helpers.js` (pure logic, no React), `analytics.js` (pure functions, no React), `react.js` (the actual components, `'use client'`), and the root (Node-only: catalog/affiliate/audit/l99). This split exists because mixing `node:fs`-dependent code with client-component code in one file poisons the browser bundle — Turbopack will hard-fail trying to bundle `node:fs` for the client. Keep them separate.
- **No `package.json` `"exports"` field.** Verified 2026-07-06: Next.js's bundler (Turbopack, this Next version) cannot resolve ANY subpath of this package through the `exports` field when the package is consumed via a pnpm `link:` symlink — fails with a plain "module not found" regardless of extension, conditions, or fallback shape. The workaround is plain filesystem-based subpath resolution: real files sitting at the package root (`react.js`, `catalog-helpers.js`, `analytics.js`, `catalog.js`, `affiliate.js`, `audit.js`, `l99.js`) that just re-export from `./dist/...`. This is NOT elegant but it is the confirmed-working shape. **Re-test this once the package is installed as a real git dependency instead of a `link:`** — the exports-field bug may be specific to the symlink case and might not reproduce once it's a normal git-cloned dependency. If it doesn't reproduce, reintroducing a clean `exports` field is worth doing, but don't assume it's fixed without testing.
- **`CatalogProvider` (React Context), not a factory function.** The original design had `createCatalogComponents(catalog)` return fresh bound components. That fails a real React Server Components rule: you cannot call a plain exported function from a `'use client'` module directly from server code (like `mdx-components.tsx`), even though the function itself doesn't touch the browser. Context sidesteps this — the components are static, stable exports; only `<CatalogProvider>` is rendered (not called) once in each site's root `layout.tsx`.
- **Explicit `.js` extensions on every relative import**, and `moduleResolution: "NodeNext"`. Two real, pre-existing latent bugs were found and fixed while building this: `catalog.ts` used CommonJS `require()` inside an ESM (`"type": "module"`) package — would throw at runtime the first time anyone actually executed it; and every relative import across `src/` omitted the `.js` extension, which `"moduleResolution": "bundler"` silently allows but real Node ESM does not. Both were latent — nothing had exercised the compiled output as a real dependency until this session.

## Before this works in production (do this before/when pushing)

1. **Change the dependency string.** Every consuming site's `package.json` currently has:
   ```json
   "@agentic-income/engine": "link:../affiliate-agent-skills"
   ```
   This must become a real git dependency once this repo is pushed:
   ```json
   "@agentic-income/engine": "github:frankxai/affiliate-agent-skills"
   ```
   (or pin to a tag/commit for stability — recommended once this stabilizes). `link:` only works for local development; Vercel's build has no sibling repo to link to.
2. **Verify the `prepare` script fires on git-dependency install.** `package.json` has `"prepare": "npm run build"`, which npm/pnpm run automatically for git dependencies specifically so `dist/` doesn't need to be committed. This should Just Work, but hasn't been verified against a real git install yet — only against a local symlink and a manually-copied real directory. First real deploy is the real test.
3. **Re-test whether the `exports`-field workaround is still needed.** See the architecture note above — the symlink may have been the actual trigger for that bug, not subpath exports themselves.

## Verification method used tonight

Local `pnpm link:` testing hit a Next.js/Turbopack bug that could not resolve package subpaths through a symlink. To verify the actual package/component code was correct (not just "resolves somehow"), each fix was validated by manually deleting the symlink and copying the real built package into `node_modules/@agentic-income/engine`, simulating what a real git-dependency install produces (pnpm clones git deps into real, non-symlinked directories). The full production build (`npm run build`) succeeded end-to-end against that real copy — 33 pages, all routes, on the hub (`agenticincome`). This is strong evidence the design is correct; it is not the same as having verified an actual `pnpm install` against a pushed git URL, which is the one remaining unverified step.

## Sites migrated so far

- [x] `agenticincome` (hub) — fully migrated, build-verified (33 pages).
- [x] `agenticpassiveincome` — fully migrated, build-verified (14 pages). Analytics subsystem backfilled (never existed here — plain `<a>` tags, zero click tracking, before this).
- [x] `disruptivepassiveincome` — fully migrated, build-verified (14 pages). Same analytics backfill.

All three: real production build succeeded against a manually-copied real directory (not the `link:` symlink — see the architecture note above). `package.json` in each still has `"link:../affiliate-agent-skills"` — change to `"github:frankxai/affiliate-agent-skills"` before/when pushing, per item 1 above.

- [x] `agentic-income-template` — also fully migrated + build-verified (10 pages). This was the important one to not skip: it's the clone-and-deploy starter for "site #4," and until it matched this pattern, forking it would have reintroduced the exact per-repo component drift this whole session exists to fix.
