# Agentic Income Starter Kit

Build your own honest AI-tool income site in an afternoon, using this open engine. No audience or product required to start. Free, MIT, yours to fork.

If you'd rather skip the build, the [agentic-income network](https://agenticincome.ai) runs this exact system — read it to see the shape in production.

## What you'll have at the end

A static, fast Next.js site with: honest comparison posts in the shape AI search engines cite, a sortable tool table that converts, an email capture, and affiliate links that go live the moment you join a program — wired to the shared catalog in this repo.

## The five steps

**1. Clone the engine as your substrate.**
```bash
git clone https://github.com/frankxai/affiliate-agent-skills
```
`data/programs.json` is your source of truth for every affiliate program — commission, recurring terms, signup URL, and your `ourLink` (null until you join).

**2. Scaffold the site** (any AI coding agent — Claude Code, Cursor — with this prompt):
> Scaffold a Next.js 16 (App Router) + Tailwind + MDX affiliate site. Read this engine's `README.md`, `BUSINESS.md`, `data/programs.json`, and `content-backlog.md` first. Build: a `lib/affiliate.ts` that loads `programs.json` and exposes `getLink(tool)` → ourLink or null (render plain text when null — never a dead link); components `AffiliateLink`, `AffiliateDisclosure`, `ComparisonTable` (sortable), `AnswerBox`, `FaqSection` (+FAQPage JSON-LD); and the top posts from `content-backlog.md`, each with answer box + table + 5 FAQ + one disclosure. Deploy to Vercel.

**3. Write one honest comparison.** Pick a tool category you actually use. Direct answer up top, sortable table, the genuine pick, a real FAQ. Honesty is the moat — recommend the truth, link the payer you'd actually buy.

**4. Join one recurring-payer and set `ourLink`.** Start with the priority-1 programs in the catalog (recurring beats one-time). Set `ourLink` in `programs.json`, and every mention across your site goes live.

**5. Add one email capture.** Now every reader is income *or* a future relationship. That list is the asset no algorithm can take away.

## The loops that make it compound

Run `skills/affiliate-audit` weekly: it tells you which programs to join next and which posts are mentioning a payer with no link. Run the `agentic-income` brain when you're deciding what to build next. The system tells you where the money is — you just execute.

## The rules (they're what make it work)

1. Honest pick always wins — never let a commission override the truth.
2. Recurring > one-time — that's where passive income compounds.
3. Own the audience — capture the email.
4. Build the engine once, fork the sites.
5. One disclosure per page. Re-verify affiliate terms before relying on them.

Full reasoning in [`BUSINESS.md`](./BUSINESS.md). Go build.
