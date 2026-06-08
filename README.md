# affiliate-agent-skills

The shared engine for the **agentic-income network** — a hub-and-spoke of honest AI-tool comparison sites. Open source on purpose: giving the method away is the distribution. See [`BUSINESS.md`](./BUSINESS.md) for the full plan.

```
affiliate-agent-skills   ← THIS REPO. The engine: catalog + audit + operating brain.
        │  (consumed by every site)
        ├─► agenticincome.ai            ← HUB (flagship). The authority brand.
        ├─► agenticpassiveincome.ai     ← spoke: "set it and forget it" angle.
        └─► disruptivepassiveincome.com ← spoke: "tools replacing job functions" angle.
```

Spokes cross-link up to the hub for topical authority + referral flow. One engine, three brands, three search audiences — adding a site is a `lib/site.ts` swap.

The thesis: **AI-tool comparison content is the affiliate monetization engine.** Frontier names (OpenAI, Anthropic, Google, Runway, Midjourney) drive search traffic but pay nothing — so rank for them, then place affiliate links on the adjacent **recurring payers** the post recommends. Lead with Higgsfield (15% recurring), then Systeme.io (60% lifetime) / CapCut / ElevenLabs / Copy.ai.

## What's in here

| Path | Role |
|------|------|
| `data/programs.json` | **Source of truth.** Every AI-tool affiliate program: commission, recurring, cookie, network, signup URL, `ourLink`. |
| `data/programs.csv` | Spreadsheet mirror. |
| `scripts/affiliate-audit.mjs` | Join catalog × a site's content × traffic → which programs to join + which posts to link. |
| `skills/affiliate-audit/` | Agent skill wrapping the audit + the strategy rules. |
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

_Catalog researched 2026-06-05. Re-verify program terms before relying on them — they change often._
