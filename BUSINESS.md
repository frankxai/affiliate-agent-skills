# The Agentic Income Business Plan

_How to build an income system with AI agents that scales itself — and helps everyone who reads it do the same._

This is the public playbook. It's open on purpose: giving the method away is the distribution. If you run it better than us, good — the engine is MIT.

---

## 1. The one-sentence model

Rank for the AI tools everyone searches, tell the honest truth about them, route to the adjacent tools that pay recurring, capture the email, and let one shared engine power every site — so adding the next site costs almost nothing and the whole thing compounds while you sleep.

## 2. Why this works when most "passive income" doesn't

Most passive-income plays fail on one of three things: no traffic, no trust, or no recurring revenue. This model is built to beat all three structurally, not through hustle.

- **Traffic** comes from the highest-volume queries on earth — "best AI tool for X", "X vs Y", "is X worth it" — which grow every month as AI adoption grows. You're surfing a rising tide, not fighting for a shrinking niche.
- **Trust** is enforced by the architecture: the honest pick always wins, the link is always downstream, one disclosure per page. You can't quietly sell out because the system recommends the truth first by design.
- **Recurring revenue** is the default: the catalog is ranked so the tools you build around (Higgsfield, Systeme.io, CapCut, ElevenLabs) pay every month, not once.

The frontier-tools insight is the unlock: **ChatGPT, Claude, Midjourney, Veo have no affiliate programs.** Everyone writes about them for the traffic and monetizes nothing. We capture the same traffic and route it to the recurring-payers those posts honestly recommend.

## 3. The network: hub-and-spoke

| Property | Role | Angle |
|---|---|---|
| **agenticincome.ai** | Hub (flagship) | The authority brand — "build a system that earns." |
| **agenticpassiveincome.ai** | Spoke | "Set it once, let it run." |
| **disruptivepassiveincome.com** | Spoke | "The tools quietly replacing whole job functions." |
| **affiliate-agent-skills** | Engine | The shared catalog + audit + operating brain. OSS. |

Three brands, three search audiences, near-zero content overlap, **one engine**. Spokes cross-link up to the hub for topical authority and referral flow. The hub concentrates brand equity; the spokes spread SERP real-estate. If one wins, double down. The losers cost almost nothing because they're forks.

## 4. How it scales effortlessly

The whole point: effort goes into the **substrate**, never the Nth instance.

- **One catalog** (`data/programs.json`) is the single source of truth for every affiliate link on every site. Join a program once, set `ourLink`, run `sync:catalog` — and every mention across the network goes live simultaneously.
- **One template.** Each site is the same Next.js shell; `lib/site.ts` is the only file that changes between brands. Forking a new spoke is a copy + a brand swap + deploy.
- **One brain** (the `agentic-income` skill) means any AI agent — in any of these repos, on any harness — executes the same playbook without a human re-explaining strategy. The doctrine is in the repo, not in someone's head.

Adding site #4 is an afternoon. Adding affiliate program #30 is one catalog edit that propagates everywhere. That's the leverage.

## 5. The agents that learn (four self-improving loops)

This isn't a static site you abandon. Four loops run on a cadence and feed each other — an agent can run all four:

1. **Monetization loop** (weekly) — `affiliate-audit` finds posts mentioning a payer with no link, and ranks which program to join next. Close the gap; revenue appears on traffic you already have.
2. **Content loop** (weekly) — top-traffic queries rank the next post to write by opportunity. The winners tell you what to write next.
3. **Authority loop** (continuous) — the OSS engine earns stars + inbound links → lifts every site that consumes it.
4. **Learning loop** (monthly) — every post is a labeled example (query × shape × conversion). Bias the next batch toward what converted. The system gets smarter with every publish.

## 6. The revenue ladder

Each visitor can climb. Every rung is a different income stream from the same content:

1. **Affiliate (recurring)** — the floor. Honest comparisons → recurring-payer signups.
2. **Owned list** — email capture → a relationship you control, immune to algorithm changes.
3. **Your own product** — once the list exists, a template/course/tool sold direct is pure margin (and the highest-leverage rung; see private strategy for which products fit).
4. **The engine itself** — OSS authority → inbound (consulting, partnerships, the brand).

Affiliate funds the lights; the list and the product are where it compounds.

## 7. Roadmap

**Phase 1 — Prove the shape (now).** Flagship hub live with cornerstone posts in the citable shape. One ranking post proves the template before any spoke is forked. Join the first recurring-payer (Higgsfield) and set `ourLink`.

**Phase 2 — Close the money loop.** Run `affiliate-audit` weekly. Join the top-flagged programs. Every payer mentioned in a ranking post gets a link.

**Phase 3 — Fork the spokes.** Once the hub has ranking proof, fork `agenticpassiveincome.ai` and `disruptivepassiveincome.com` from the template. Same engine, different angle + backlog.

**Phase 4 — Build the list, then the product.** Email capture on every post → first owned-audience asset → first direct product to the warmest readers.

**Phase 5 — Let it compound.** The four loops run on cadence. New posts, new programs, new sites slot into the substrate. The work becomes curation, not construction.

## 8. The principles that keep it honest

The honest pick always wins. Recurring over one-time. Own the audience. Build the engine once. Compounding over spikes. Recommend, never sell. Trust is the only asset that compounds — protect it above any single commission.

---

_Run the `agentic-income` skill for the operating brain, `affiliate-audit` for the money loop. Catalog terms change — re-verify before relying on them._
