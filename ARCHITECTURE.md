# Network Architecture + Build Plan

Three repos, one flywheel. This doc is the build plan for the two sites and the ready-to-run prompt to scaffold them in a fresh session.

## The network

| Repo | Role | Stack |
|------|------|-------|
| **affiliate-agent-skills** (this) | Shared engine — catalog, audit, skills, content backlog | Node scripts + JSON + skill md |
| **agenticpassiveincome** | Site 1 — angle: *agentic / AI-architect* audience. "Build a system that earns." | Next.js 16 (App Router) + MDX content |
| **disruptivepassiveincome** | Site 2 — angle: *disruption / contrarian* audience. "The tools quietly replacing $X." | Next.js 16 + MDX (same shell, different brand) |

Both sites consume the same engine: import `programs.json` for affiliate links, run `affiliate-audit.mjs` against their `content/`, and draw from `content-backlog.md` for posts. Different brand/voice/domain, shared substrate — so one catalog update propagates everywhere.

## Why two sites, not one

Different search audiences, minimal content overlap, shared engine = near-zero marginal cost for the second site. Cross-link them (footer + relevant in-content) for topical authority and referral flow. If one wins, double down; the loser costs almost nothing.

## Site architecture (identical shell)

```
<site>/
  app/                      Next.js App Router
    page.tsx                home — top comparisons + email capture
    blog/[slug]/page.tsx    MDX article renderer (Article + FAQPage JSON-LD)
    blog/page.tsx           index
  components/
    AffiliateLink.tsx       reads programs.json ourLink + appends nothing if null (renders plain text)
    AffiliateDisclosure.tsx one per page with links
    ComparisonTable.tsx     the money component — sortable tool table
  content/blog/*.mdx        posts from content-backlog.md
  lib/affiliate.ts          loads ../affiliate-agent-skills/data/programs.json (or vendored copy)
  data/traffic.json         per-site traffic paste (for the audit)
```

## Build order (for the fresh session)

1. **Engine first** (done): catalog + audit + skills live here.
2. **Scaffold Site 1** (`agenticpassiveincome`): Next.js 16 + MDX shell, `AffiliateLink`/`Disclosure`/`ComparisonTable` components, `lib/affiliate.ts` reading the catalog, deploy to Vercel.
3. **First 5 posts** from `content-backlog.md` top-5 (faceless-YouTube stack, ElevenLabs alternatives, Suno-vs-Udio, Claude Code pricing, Cursor-vs-Claude-vs-Windsurf) — each with a ComparisonTable + the recurring-payer links.
4. **Fork to Site 2** (`disruptivepassiveincome`): same shell, different brand tokens + voice, 5 different-angle posts.
5. **Cross-link + sitemap + analytics**, then run `/affiliate-audit` weekly per site.

## Ready-to-run new-session prompt

> Paste this into a fresh Claude Code session opened in `starlight/repos/agenticpassiveincome`:

```
Scaffold agenticpassiveincome as a Next.js 16 (App Router) MDX affiliate site.
Read ../affiliate-agent-skills/README.md + ARCHITECTURE.md + data/programs.json + content-backlog.md first.

Build:
1. Next.js 16 + Tailwind + MDX shell (glassmorphic dark, match FrankX taste.md restraint).
2. lib/affiliate.ts that loads ../affiliate-agent-skills/data/programs.json and exposes
   getLink(tool) → ourLink or null (render plain text when null — never a dead link).
3. components: AffiliateLink, AffiliateDisclosure (one per page w/ links), ComparisonTable
   (sortable, the conversion component), Article+FAQPage JSON-LD.
4. The top-5 posts from content-backlog.md, each: TL;DR answer box (AEO), comparison table,
   5+ FAQ, recurring-payer affiliate links via getLink(), disclosure.
5. Deploy to Vercel. Then run: node ../affiliate-agent-skills/scripts/affiliate-audit.mjs
   --content=./content --write  and act on the gaps.

Brand angle: agentic / AI-architect audience — "build a system that earns."
Rules: affiliate-agent-skills/skills/affiliate-audit/SKILL.md (frontier names rank, adjacents pay;
Higgsfield first; recurring > one-time; honest pick always wins; one disclosure/page).
```

(For Site 2, same prompt in `disruptivepassiveincome` with angle: *disruption / contrarian — "the tools quietly replacing $X"* and the next-5 backlog posts.)

## Status

- ✅ Engine repo seeded (catalog, audit, skills, backlog) + OSS (MIT) + `BUSINESS.md` + `agentic-income` brain.
- ✅ **Hub built** — `agenticincome.ai` flagship: Next.js 16 + MDX, 3 cornerstone posts, ComparisonTable + AnswerBox + FAQPage JSON-LD, build-green. The reusable template (`lib/site.ts` = only brand file). Repo: `frankxai/agenticincome` (private).
- ⬜ Deploy hub to Vercel + attach `agenticincome.ai` DNS.
- ⬜ Fork spoke 1 (`agenticpassiveincome.com`) from the hub template — swap `lib/site.ts`, different backlog.
- ⬜ Fork spoke 2 (`disruptivepassiveincome.com`) from the hub template.
- ⬜ Join Higgsfield + set `ourLink` → links go live network-wide.

## Forking a spoke from the hub (the new path)

The hub IS the template now — don't scaffold from scratch. In a fresh session:

```
Fork the agenticincome hub into <spoke>. Clone frankxai/agenticincome as the base,
then: (1) rewrite lib/site.ts with the spoke's brand/domain/angle + role:'spoke'
(network[] links UP to agenticincome.ai), (2) swap the 3 posts for the spoke's
backlog angle from ../affiliate-agent-skills/content-backlog.md, (3) keep every
component + lib/affiliate.ts + the engine binding identical. Build green, push to
frankxai/<spoke>, deploy. Brand angle: <spoke angle>.
```
