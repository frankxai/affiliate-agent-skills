# affiliate-agent-skills

The shared engine for the **agentic-income network** — a hub-and-spoke of honest AI-tool comparison sites. Open source on purpose: giving the method away is the distribution. See [`BUSINESS.md`](./BUSINESS.md) for the full plan.

## What this is — and what it is not

This repo is a **skill engine and an affiliate-audit toolkit**: an affiliate-program catalog, an audit that maps catalog × a site's content × traffic, three agent skills, and a registry of skills with proposed marketplace mechanics.

It is **not** financial advice, and it is not a promise of income. The fee and keep models (`marketplaceMechanics.feeModels` in `data/trinity-skill-registry.json`) are **proposals** — how a marketplace could work, not terms that are in force. Commission rates, cookie windows, and program availability change without notice; re-verify them in `data/programs.json` before relying on any number here. Nothing in this repo guarantees earnings.

**Trinity Income Portfolio Extension (2026-07-14)**: This engine also hosts the canonical **skill/agent registry + marketplace** for the Trinity Income Portfolio (Sovereign Agentic Passive Income OS — Earn • Automate • Compound).
- Versioned, discoverable skills, with proposed fee models: 100% keep by default, or a disclosed low fee on paid listings
- One-click deploy scripts and a template gallery — mechanics specified in the registry, not a hosted storefront
- MCP exposure for all Trinity actions (diagnostics, stream, earn/audit, automate/deploy, compound/ledger, marketplace, public-trust/verify)
- Cross-agent registration: Hermes, Codex, Claude, Grok, Antigravity
- Exportable skills as MCP tools, LangGraph nodes, Antigravity bundles, or standalone packages
- Public-trust checks run in the open against this repo's data and tests — not a third-party audit or certification
- Public mirror: https://github.com/Agentic-Income/affiliate-agent-skills

```
affiliate-agent-skills   <- THIS REPO. The engine: catalog + audit + operating brain + Trinity Registry/Marketplace.
        |
        |  (consumed by every site + Trinity stages)
        |
        +--> agenticincome.ai             <- HUB (flagship). The authority brand. Earn stage.
        +--> agenticpassiveincome.com     <- spoke: "set it and forget it" angle. Automate stage.
        +--> disruptivepassiveincome.com  <- spoke: "tools replacing job functions" angle. Compound stage.
```

Spokes cross-link up to the hub for topical authority + referral flow. One engine, three brands, three search audiences — adding a site is a `lib/site.ts` swap.

The thesis: **AI-tool comparison content is the affiliate monetization engine.** Frontier names (OpenAI, Anthropic, Google, Runway, Midjourney) drive search traffic but pay nothing — so rank for them, then place affiliate links on the adjacent **recurring payers** the post recommends. Lead with Higgsfield (15% recurring), then Systeme.io (60% lifetime) / CapCut / ElevenLabs / Copy.ai.

## Trinity Registry + Marketplace (New)

The data and code exist in this repo; the commercial mechanics around them are **proposals**, kept in the open so they can be reviewed and rejected.

- **Registry**: `data/trinity-skill-registry.json` + `src/trinity-registry.ts` (load, list, monetize, deploy, gallery, MCP, cross-agent)
- **MCP Exposure**: all Trinity actions are modelled as callable by any MCP-compatible agent (Claude Code, Codex, Grok, Cursor, etc.)
- **Marketplace Mechanics (proposed)**: 100% keep for free listings; a disclosed low fee (5–15%) on paid listings. One-click deploy scripts + templates (LoL royalty farm, manager agents, retainers).
- **Cross-Agent**: registered for Hermes (profiles/MCP), Codex (exec), Claude (MCP/CLAUDE.md), Grok (harness), Antigravity (awesome-skills).
- **Exportable**: as MCP tools, LangGraph nodes, Antigravity bundles, standalone packages.
- **Public-Trust**: entries checked in the open against repo data and tests; honest, no hype. Trust is the asset.

## Install and test

```bash
git clone https://github.com/Agentic-Income/affiliate-agent-skills.git
cd affiliate-agent-skills
npm install
npm test
```

`npm test` runs `tsc --build` and then the unit tests in `tests/`. `npm run type-check` and `npm run build` are available on their own. The registry is data (`data/trinity-skill-registry.json`) plus `src/trinity-registry.ts`, which the build type-checks.

## What's in here

| Path | Role |
|------|------|
| `data/programs.json` | **Source of truth.** Every AI-tool affiliate program: commission, recurring, cookie, network, signup URL, `ourLink`. |
| `data/programs.csv` | Spreadsheet mirror. |
| `data/trinity-skill-registry.json` | **Trinity Registry + Marketplace data** (skills, templates, MCP actions, fee models, cross-agent). |
| `scripts/affiliate-audit.mjs` | Join catalog × a site's content × traffic → which programs to join + which posts to link. |
| `skills/affiliate-audit/` | Agent skill wrapping the audit + the strategy rules: the money loop, catalog × content × traffic → programs to join + posts to link. |
| `skills/agentic-income/` | The operating brain: what to build next, where money comes from, how it compounds. |
| `scripts/affiliate-join-queue.mjs` + `src/join-queue.ts` | Affiliate Ops Agent phase 1: catalog × relationship registry × publisher → ranked, network-grouped application packets (human clicks Submit). |
| `skills/affiliate-ops/` | Agent skill for the join queue and the T0–T3 boundary. |
| `src/trinity-registry.ts` | **Trinity Registry implementation** (discover, monetize, one-click deploy, MCP exposure, gallery). |
| `content-backlog.md` | The 22-post long-tail/AEO pipeline (shared across all sites). |
| `BUSINESS.md` | The full business plan — model, network, scaling, the four self-improving loops, roadmap. |
| `ARCHITECTURE.md` | Site shell architecture + the new-session scaffold prompt. |

## Use it from a site

```bash
# from the engine repo, audit a sibling site's content
node scripts/affiliate-audit.mjs --content=../agenticpassiveincome/content --write
```

Update `ourLink` in `data/programs.json` the moment you join a program — every site and audit picks it up.

## Rules (non-negotiable)

- One affiliate disclosure per page with links (use the `disclosure` string in `programs.json`).
- Only link tools you actually use or tested.
- Recurring > one-time — that's where passive income compounds.
- Never let a link override the honest pick. Trust is the asset.
- Catalog `status` flags dead-ends (frontier LLMs) and closed programs (Leonardo, Notion) — the audit ignores them.
- Trinity: verify public-trust; use MCP for cross-agent; fee model is 100% keep by default, or a disclosed low fee on paid listings (a proposal, not an enforced term).

_Catalog researched 2026-06-05. Re-verify program terms before relying on them — they change often._

**Status**: registry, MCP action surface, and cross-agent registration are implemented in this repo; docs and skills are updated with them. See the git history for the change trail.
