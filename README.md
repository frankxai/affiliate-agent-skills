# affiliate-agent-skills

The shared engine for Frank's passive-income network. Three repos work together:

```
affiliate-agent-skills   ← THIS REPO. The engine: program catalog + audit + skills.
        │  (consumed by both sites)
        ├─► agenticpassiveincome      ← Site 1. AI-tool comparison content + affiliate links.
        └─► disruptivepassiveincome   ← Site 2. Sibling site, different angle, same engine.
```

The thesis: **AI-tool comparison content is the affiliate monetization engine.** Frontier names (OpenAI, Anthropic, Google, Runway, Midjourney) drive search traffic but pay nothing — so rank for them, then place affiliate links on the adjacent **recurring payers** the post recommends. Lead with Higgsfield (15% recurring), then Systeme.io (60% lifetime) / CapCut / ElevenLabs / Copy.ai.

## What's in here

| Path | Role |
|------|------|
| `data/programs.json` | **Source of truth.** Every AI-tool affiliate program: commission, recurring, cookie, network, signup URL, `ourLink`. |
| `data/programs.csv` | Spreadsheet mirror. |
| `scripts/affiliate-audit.mjs` | Join catalog × a site's content × traffic → which programs to join + which posts to link. |
| `skills/affiliate-audit/` | Agent skill wrapping the audit + the strategy rules. |
| `content-backlog.md` | The 22-post long-tail/AEO pipeline (shared across both sites). |
| `ARCHITECTURE.md` | Build plan for the two sites + the new-session build prompt. |

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
