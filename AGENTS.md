# Repository Instructions

This repo is part of the FrankX / Starlight / Arcanea agent estate.

## Classification

- Repo: affiliate-agent-skills (Shared Engine)
- Class: Canonical Trinity Income Portfolio Registry + Marketplace
- Default health command: pnpm build && node -e "import('./dist/trinity-registry.js').then(m => console.log('Trinity Registry OK'))"
- Remote: https://github.com/frankxai/affiliate-agent-skills.git
- Explicit Windows paths: C:/Users/frank/starlight/repos/affiliate-agent-skills/...

## Trinity Branding & Marketplace Absorption (2026-07-14)

**Trinity Income Portfolio**: Sovereign Agentic Passive Income OS — Earn • Automate • Compound.
- Stages: Earn (agenticincome), Automate (agenticpassiveincome), Compound (disruptivepassiveincome)
- Shared engine now includes skill/agent registry + marketplace: versioned, discoverable, monetizable (100% keep or low-fee models), one-click deploy, template gallery.
- Absorption of marketplace mechanics: registry in data/trinity-skill-registry.json + src/trinity-registry.ts (MCP-exposed actions, cross-agent registration).
- Exportable skills: Every skill/command exportable as MCP tool, LangGraph node, antigravity bundle, standalone package, or Hermes profile.
- Cross-agent registration: Hermes (profiles/MCP), Codex (.codex/skills/exec), Claude (CLAUDE.md/MCP), Grok (harness/prompts), Antigravity (awesome-skills/worktree).
- Public-trust: All entries verified via public-trust.test.mjs; honest marketing, verifiable execution proofs, no hype. Trust is the asset.

## Agent Rules

- Read this file before making changes.
- Preserve existing user work and unrelated dirty files.
- Keep edits scoped to the requested task.
- Prefer existing repo conventions over new abstractions.
- Run the health command before handoff when feasible.
- Do not publish secrets, private memory, credentials, or internal-only strategy.
- Always use explicit Windows paths (C:/Users/frank/... or /c/Users/frank/...) for local operations.

## Class-Specific Guidance

- Preserve skill/plugin/MCP schemas and frontmatter.
- Validate skills, manifests, scripts, and generated registries after edits.
- Keep public/private memory boundaries explicit.
- Trinity actions MCP-exposed: trinity/diagnostics, trinity/stream/select, trinity/earn/audit, trinity/automate/deploy, trinity/compound/ledger, trinity/marketplace/list, trinity/marketplace/deploy, trinity/public-trust/verify.
- Marketplace: 100% keep default for free listings; low-fee (5-15%) on paid; one-click via deployScript + MCP.

## Handoff

Summarize changed files, validation run, risks, and any follow-up needed.

## Design Taste Kernel

For any site, app, landing page, dashboard, visual identity, brand, motion, media, social, or frontend task, apply the shared Design Taste Kernel before handoff:

- C:/Users/frank/starlight/repos/DESIGN_TASTE.md
- C:/Users/frank/starlight/repos/WEB_EXPERIENCE_STANDARD.md
- C:/Users/frank/starlight/repos/MOTION_TASTE_RUBRIC.md
- C:/Users/frank/starlight/repos/MULTI_AGENT_DESIGN_COUNCIL.md
- C:/Users/frank/starlight/repos/VISUAL_QA_GATE.md

When motion, scroll, generated media, GIF/video, or premium polish matters, route through the Motion Design Studio plugin/skills and verify the result visually.

## Production e2e Note

All changes on main. Excellence review: build + registry load test + MCP action execution. Push to main after verification. GitHub: https://github.com/frankxai/affiliate-agent-skills

Artifacts:
- data/trinity-skill-registry.json (registry + marketplace data)
- src/trinity-registry.ts (implementation + MCP exposure)
- Updated src/index.ts, README.md, AGENTS.md
- GitHub main: https://github.com/frankxai/affiliate-agent-skills/tree/main
