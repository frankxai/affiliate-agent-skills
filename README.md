# affiliate-agent-skills

The shared engine for the **agentic-income network** — a hub-and-spoke of honest AI-tool comparison sites. Open source on purpose: giving the method away is the distribution. See [`BUSINESS.md`](./BUSINESS.md) for the full plan.

**Trinity Income Portfolio Extension (2026-07-14)**: This engine now hosts the canonical **skill/agent registry + marketplace** for the Trinity Income Portfolio (Sovereign Agentic Passive Income OS — Earn • Automate • Compound).
- Versioned, discoverable, monetizable (100% keep or low-fee models)
- One-click deploy, template gallery
- MCP exposure for all Trinity actions (diagnostics, stream, earn/audit, automate/deploy, compound/ledger, marketplace, public-trust/verify)
- Cross-agent registration: Hermes, Codex, Claude, Grok, Antigravity
- Exportable skills as MCP/LangGraph/antigravity/standalone
- Public-trust verified; explicit Windows paths (C:/Users/frank/starlight/repos/affiliate-agent-skills/...)
- GitHub: https://github.com/frankxai/affiliate-agent-skills

```
affiliate-agent-skills   ← THIS REPO. The engine: catalog + audit + operating brain + Trinity Registry/Marketplace.
        │  (consumed by every site + Trinity stages)
        ├─► agenticincome.ai            ← HUB (flagship). The authority brand. Earn stage.
        ├─► agenticpassiveincome.com    ← spoke: "set it and forget it" angle. Automate stage.
        └─► disruptivepassiveincome.com ← spoke: "tools replacing job functions" angle. Compound stage.
```

Spokes cross-link up to the hub for topical authority + referral flow. One engine, three brands, three search audiences — adding a site is a `lib/site.ts` swap.

The thesis: **AI-tool comparison content is the affiliate monetization engine.** Frontier names (OpenAI, Anthropic, Google, Runway, Midjourney) drive search traffic but pay nothing — so rank for them, then place affiliate links on the adjacent **recurring payers** the post recommends. Lead with Higgsfield (15% recurring), then Systeme.io (60% lifetime) / CapCut / ElevenLabs / Copy.ai.

## Trinity Registry + Marketplace (New)

- **Registry**: `data/trinity-skill-registry.json` + `src/trinity-registry.ts` (load, list, monetize, deploy, gallery, MCP, cross-agent)
- **MCP Exposure**: All Trinity actions callable by any MCP-compatible agent (Claude Code, Codex, Grok, Cursor, etc.)
- **Marketplace Mechanics**: 100% keep default; low-fee (5-15%) on paid listings. One-click deploy scripts + templates (LoL royalty farm, manager agents, retainers).
- **Cross-Agent**: Registered for Hermes (profiles/MCP), Codex (exec), Claude (MCP/CLAUDE.md), Grok (harness), Antigravity (awesome-skills).
- **Exportable**: As MCP tools, LangGraph nodes, antigravity bundles, standalone packages.
- **Public-Trust**: Verified execution; honest, no hype.

Usage (explicit Windows path):
```bash
cd C:/Users/frank/starlight/repos/affiliate-agent-skills
node --loader ts-node/esm src/trinity-registry.ts
# Or after build: node dist/trinity-registry.js
```

## What's in here

| Path | Role |
|------|------|
| `data/programs.json` | **Source of truth.** Every AI-tool affiliate program: commission, recurring, cookie, network, signup URL, `ourLink`. |
| `data/programs.csv` | Spreadsheet mirror. |
| `data/trinity-skill-registry.json` | **Trinity Registry + Marketplace data** (skills, templates, MCP actions, fee models, cross-agent). |
| `scripts/affiliate-audit.mjs` | Join catalog × a site's content × traffic → which programs to join + which posts to link. |
| `skills/affiliate-audit/` | Agent skill wrapping the audit + the strategy rules. |
| `skills/agentic-income/` | The operating brain: what to build next, where money comes from, how it compounds. |
| `src/trinity-registry.ts` | **Trinity Registry implementation** (discover, monetize, one-click deploy, MCP exposure, gallery). |
| `content-backlog.md` | The 22-post long-tail/AEO pipeline (shared across all sites). |
| `BUSINESS.md` | The full business plan — model, network, scaling, the four self-improving loops, roadmap. |
| `skills/agentic-income/` | The operating brain: what to build next, where money comes from, how it compounds. |
| `skills/affiliate-audit/` | The money loop: catalog × content × traffic → which programs to join + posts to link. |
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
- Trinity: Always verify public-trust; use MCP for cross-agent; 100% keep or disclosed low-fee; explicit Windows paths.

_Catalog researched 2026-06-05. Re-verify program terms before relying on them — they change often._

**Trinity Production e2e**: Registry implemented, MCP exposed, docs updated with branding/marketplace/cross-agent. Excellence review + push to main complete. GitHub: https://github.com/frankxai/affiliate-agent-skills

Artifacts delivered:
- C:/Users/frank/starlight/repos/affiliate-agent-skills/data/trinity-skill-registry.json
- C:/Users/frank/starlight/repos/affiliate-agent-skills/src/trinity-registry.ts
- Updated README.md, AGENTS.md, src/index.ts
- GitHub main: https://github.com/frankxai/affiliate-agent-skills (production e2e on main)