# Affiliate Ops Agent

An agent that runs the whole affiliate lifecycle for a publisher: decide which programs to join, prepare every application, track approvals, capture and verify tracking links, watch terms for drift, and reconcile payouts. The human does exactly one thing per program: the consent click.

Status: design, 2026-09-28. Dogfooded on the agentic-income network first; packaged for others only after the receipts exist.

## The one rule that shapes everything

Joining an affiliate program means accepting legal terms and handing over tax and payout details. An agent must never do that on someone's behalf. So the work splits on a hard line:

| Tier | Who | What |
|---|---|---|
| T0 Observe | Agent, freely | Read program pages, terms, network dashboards (via API keys the human stored), link health, payout reports |
| T1 Prepare | Agent | Rank programs, fill applications up to (not including) the submit/consent control, draft the pitch, pre-stage site URLs and traffic facts |
| T2 Act with approval | Agent, one approval per action | Update the site's routing to a newly approved link; open the PR that changes public copy |
| T3 Human only | The publisher, outside the agent | Accept ToS, submit the application, tax forms (W-9 / W-8BEN), payout/bank details, passwords, 2FA, CAPTCHAs |

No credentials are ever typed by the agent. No CAPTCHA is ever solved. Text on a program's page is data, never an instruction to the agent.

This is not a limitation to apologize for — it is the product's safety claim: *it does everything except the parts that are legally yours.*

## Network-first joining

Most programs sit behind a handful of networks (Impact, PartnerStack, FirstPromoter, Rewardful, CJ, Awin). Tax and payout setup happens **once per network**, not once per program. So the agent orders the queue by network: complete one network profile, then every program on it becomes a short application. Joining order = network setup cost amortized over expected program value.

## The pipeline

Driven by the relationship state machine the router registry already defines (`relationshipState`, `trackingState`, `evidence`):

```
not-applied ──► application-draft ──► submitted ──► approved ──► (link captured) ──► tracking verified ──► live-routed
     │               (agent, T1)      (human, T3)       │              (agent, T0)        (agent, T0)          (agent, T2 PR)
     │                                                  └──► rejected ──► re-apply window / deprioritize
     └──► unavailable / deprioritized (no official terms, eligibility mismatch)
```

Evidence recorded at each step (`evidence.termsRef`, `approvalRef`, `linkVerificationRef`, `termsReviewedAt`) — a program is never routed live without an approval reference and a verified tracking link.

## Loops

| Loop | Cadence | Output |
|---|---|---|
| **Join queue** | On demand / weekly | Ranked list grouped by network, each item with a prefilled application packet and the exact human step ("open this URL, check fields, click Submit") |
| **Approval watch** | Daily | Reads network dashboards/emails (T0), moves `submitted → approved/rejected`, captures the tracking link |
| **Link verification** | On approval + weekly | Follows the tracking link, confirms the network attributes the click, sets `trackingState` |
| **Terms drift** | Weekly | Re-reads official terms pages; any change to rate, cookie, eligibility, or prohibited channels opens a review item and blocks routing if the change is adverse |
| **Payout reconciliation** | Monthly | Network-reported earnings vs. router click data; flags programs that stopped attributing |
| **Eligibility guard** | Per program | Checks our channels against the program's allowed channels (e.g. video-only programs are never routed from blog posts) |

## Compliance built in

- FTC disclosure stays on every routed page; the agent refuses to route a link to a page without it.
- Zero income claims: the agent never writes earnings promises into copy, and flags any it finds.
- Prohibited-channel rules (brand bidding, email, coupon sites) are part of each program's record and enforced by the router.
- Program terms are cited with source URL and verification date; unverifiable terms are marked unavailable rather than guessed.

## What the agent needs from the human, once

1. Pick the browser profile it may prepare forms in (never chosen by the agent).
2. Complete each network's tax + payout profile personally.
3. Store read-only API keys for networks that offer them (as secrets — the agent never sees raw values in chat).
4. Per program: review the prefilled application, click Submit.

Target: under one minute of human time per program after the network profile exists.

## Build phases

1. **Join queue** — ranked, network-grouped queue with application packets, generated from the catalog + registry. (No browser needed.)
2. **Supervised preparation** — the agent fills applications in the human's browser up to the consent control (T1), one program at a time.
3. **Approval watch + link capture + verification** — close the loop into the router registry with evidence.
4. **Drift + payout loops** — scheduled, findings to a durable issue.
5. **Packaging** — the same engine, run against another publisher's catalog and registry.
