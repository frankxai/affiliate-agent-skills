// Affiliate Ops Agent — Phase 1: the join queue.
// See docs/AFFILIATE-OPS-AGENT.md. Pure functions only: no network, no browser, no credentials.
//
// Input:  catalog (data/programs.json) + relationship registry (go-agenticincome programs.schema.json)
//         + publisher facts (sites, channels, audience) + optional eligibility rules.
// Output: a ranked, network-grouped queue of application packets. The agent prepares (T1);
//         the publisher submits (T3). Nothing here ever submits, accepts terms, or types credentials.
//
// Self-contained on purpose (no relative imports) so the compiled dist file loads from the CLI and tests.

// ---------- Input types ----------

/** Catalog row (subset of src/catalog.ts Program that the queue reads). */
export type CatalogProgram = {
  tool: string;
  category?: string;
  hasProgram: boolean;
  priority?: number;
  commission?: string;
  recurring?: string;
  cookieDays?: number | null;
  network?: string;
  signupUrl?: string;
  status?: string;
  note?: string;
  verifiedAt?: string;
  commissionNote?: string;
  commissionSourceUrl?: string;
  commissionVerifiedAt?: string;
};

export type CatalogInput = { updatedAt: string; programs: CatalogProgram[] };

/** Mirrors go-agenticincome data/programs.schema.json. */
export type RelationshipState =
  | 'not-applied'
  | 'application-draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'unverified'
  | 'deprioritized'
  | 'unavailable';
export type TrackingState = 'missing' | 'untested' | 'verified' | 'broken' | 'suspended';
export type RegistryChannel = 'web' | 'email' | 'social';
export type RegistryEvidence = {
  approvalRef?: string;
  linkVerificationRef?: string;
  termsRef?: string;
  termsReviewedAt?: string;
};
export type RegistryProgram = {
  tool: string;
  network?: string;
  status?: string;
  relationshipState: RelationshipState;
  trackingState: TrackingState;
  allowedChannels: RegistryChannel[];
  evidence: RegistryEvidence;
};
export type RegistryInput = { updatedAt: string; programs: RegistryProgram[] };

export type PublisherChannelType = 'blog' | 'newsletter' | 'video' | 'social';
export type PublisherChannel = {
  type: PublisherChannelType;
  url?: string;
  /** Followers / subscribers / monthly visitors, exactly as the publisher can evidence it. Omit if unknown. */
  audienceSize?: number;
};
export type Publisher = {
  name: string;
  sites: { url: string; focus?: string }[];
  niche: string;
  audience: string;
  channels: PublisherChannel[];
  promotionMethods: string[];
  /** Verifiable traffic statements only. Empty = the pitch says nothing about traffic. */
  trafficFacts?: { statement: string; asOf: string }[];
  country?: string;
};

/** Publicly documented eligibility requirement a program's own terms impose (data/program-eligibility.json). */
export type EligibilityRule = {
  tool: string;
  /** Publisher needs at least one of these channels... */
  qualifyingChannels: PublisherChannelType[];
  /** ...with at least this audience on it (unknown audience = does not qualify). */
  minAudience?: number;
  summary: string;
  source: string;
  verifiedAt: string;
};

// ---------- Output types ----------

export type ProgramValue = {
  /** Customer-months: share of one referred customer's monthly subscription, summed over the commission window. */
  points: number;
  rateBasis: string;
  windowBasis: string;
  assumptions: string[];
};

export type PrefillField = { field: string; value: string; tier: 'T1' | 'T3' };

export type ApplicationPacket = {
  tool: string;
  network: string;
  signupUrl: string;
  registryState: RelationshipState | 'not-in-registry';
  value: ProgramValue;
  fields: PrefillField[];
  pitch: string;
  terms: {
    commission: string;
    window: string;
    cookieDays: number | null;
    detail: string | null;
    sourceUrl: string;
    verifiedAt: string | null;
  };
  warnings: string[];
  humanStep: { tier: 'T3'; text: string };
};

export type NetworkGroup = {
  network: string;
  sharedSetup: boolean;
  setupCost: number;
  setupAlreadyDone: boolean;
  totalValue: number;
  score: number;
  setupStep: string | null;
  programs: ApplicationPacket[];
};

export type Excluded = { tool: string; reason: string };
export type Held = { tool: string; network: string; reason: string };

export type JoinQueue = {
  generatedAt: string;
  inputs: { catalogUpdatedAt: string; registryUpdatedAt: string; publisher: string };
  scoring: string[];
  groups: NetworkGroup[];
  held: Held[];
  excluded: Excluded[];
};

// ---------- Scoring constants (the whole model; change here, nowhere else) ----------

/** One-time setup cost per network, in rough "account setups" (account + identity + tax + payout). */
export const NETWORK_SETUP_COST: Record<string, number> = { Impact: 3, Partnerize: 3, PartnerStack: 2 };
/** Networks where one partner account + one tax/payout profile covers every program on it. */
export const SHARED_SETUP_NETWORKS = new Set(Object.keys(NETWORK_SETUP_COST));
/** Program without a shared network: its own portal, own payout details. */
export const PER_PROGRAM_SETUP_COST = 1;
/** When the publisher already has a live account on a shared network, only the application remains. */
export const EXISTING_ACCOUNT_SETUP_COST = 1;
/** Flat bounties are converted to customer-months against this reference plan price. */
export const REFERENCE_PLAN_USD = 20;
/** Rate assumed when the catalog publishes none, so unknown-rate programs sink rather than vanish. */
export const UNKNOWN_RATE = 0.1;
/** "Lifetime" is counted over this horizon. */
export const LIFETIME_MONTHS = 24;
/** Terms not yet read on the program's own page count at half value: a second-hand rate is a guess. */
export const UNVERIFIED_TERMS_FACTOR = 0.5;

const EXCLUDED_STATUSES = new Set(['dead-end', 'closed', 'deprioritized', 'unavailable']);
const HOLD_STATUSES = new Set(['verify', 'needs-verification']);
const CHANNEL_TO_REGISTRY: Record<PublisherChannelType, RegistryChannel> = {
  blog: 'web',
  newsletter: 'email',
  video: 'social',
  social: 'social',
};

// ---------- Pure helpers ----------

export function normalizeNetwork(raw?: string): string {
  const n = (raw || '').trim().toLowerCase();
  if (!n) return 'direct';
  if (n.startsWith('impact') || n.includes('/impact')) return 'Impact';
  if (n.startsWith('partnerize')) return 'Partnerize';
  if (n === 'partnerstack') return 'PartnerStack';
  if (n === 'firstpromoter') return 'FirstPromoter';
  if (n === 'rewardful') return 'Rewardful';
  if (n.startsWith('direct')) return 'direct';
  if (n === 'multiple') return 'direct';
  return raw!.trim();
}

export function parseCommission(commission?: string): { percent?: number; flatUsd?: number } {
  const c = commission || '';
  const pct = c.match(/(\d+(?:\.\d+)?)\s*%/);
  const flat = c.match(/\$\s*(\d+(?:\.\d+)?)/);
  return {
    percent: pct ? Number(pct[1]) : undefined,
    flatUsd: flat ? Number(flat[1]) : undefined,
  };
}

export function commissionWindowMonths(recurring?: string): { months: number; basis: string } {
  const r = (recurring || '').trim().toLowerCase();
  if (r === 'lifetime') return { months: LIFETIME_MONTHS, basis: `lifetime (counted as ${LIFETIME_MONTHS} months)` };
  const m = r.match(/^(\d+)-month/);
  if (m) return { months: Number(m[1]), basis: `${m[1]} months` };
  if (r === 'year-1') return { months: 12, basis: 'first year (12 months)' };
  if (r.startsWith('one-time')) return { months: 1, basis: 'one-time' };
  if (r === 'recurring') return { months: 12, basis: 'recurring, duration unstated (counted as 12 months)' };
  return { months: 1, basis: 'window unknown (counted as one-time)' };
}

export function programValue(p: CatalogProgram): ProgramValue {
  const { percent, flatUsd } = parseCommission(p.commission);
  const { months, basis } = commissionWindowMonths(p.recurring);
  const assumptions: string[] = [];
  let points = 0;
  const rateParts: string[] = [];
  if (percent !== undefined) {
    points += (percent / 100) * months;
    rateParts.push(`${percent}%`);
  }
  if (flatUsd !== undefined) {
    points += flatUsd / REFERENCE_PLAN_USD;
    rateParts.push(`$${flatUsd} flat`);
    assumptions.push(`flat bounty counted against a $${REFERENCE_PLAN_USD}/month reference plan`);
  }
  if (percent === undefined && flatUsd === undefined) {
    points = UNKNOWN_RATE * months;
    rateParts.push('rate not published');
    assumptions.push(`no published rate — assumed ${UNKNOWN_RATE * 100}% so it ranks low until verified`);
  }
  if (/up to/i.test(p.commission || '')) assumptions.push('"up to" rate taken at face value — the base tier may be lower');
  if (!(p.commissionVerifiedAt || p.verifiedAt)) {
    points *= UNVERIFIED_TERMS_FACTOR;
    assumptions.push(`terms unverified — value × ${UNVERIFIED_TERMS_FACTOR}`);
  }
  return { points: round(points), rateBasis: rateParts.join(' + '), windowBasis: basis, assumptions };
}

/** Publisher channel types that satisfy an eligibility rule. */
export function qualifyingChannels(publisher: Publisher, rule: EligibilityRule): PublisherChannel[] {
  return publisher.channels.filter(
    (c) =>
      rule.qualifyingChannels.includes(c.type) &&
      (rule.minAudience === undefined || (c.audienceSize !== undefined && c.audienceSize >= rule.minAudience)),
  );
}

/** Returns an exclusion reason if the program's channel rules rule this publisher out, else null. */
export function channelConflict(
  publisher: Publisher,
  reg: RegistryProgram | undefined,
  rule: EligibilityRule | undefined,
): string | null {
  if (rule && qualifyingChannels(publisher, rule).length === 0) {
    const need = rule.qualifyingChannels.join(' or ');
    const min = rule.minAudience !== undefined ? ` with ${rule.minAudience.toLocaleString('en-US')}+ audience` : '';
    return `eligibility: needs a ${need} channel${min}; publisher has none (${rule.summary}; ${rule.source}, verified ${rule.verifiedAt})`;
  }
  if (reg && reg.allowedChannels.length > 0) {
    const ours = new Set(publisher.channels.map((c) => CHANNEL_TO_REGISTRY[c.type]));
    if (!reg.allowedChannels.some((ch) => ours.has(ch))) {
      return `eligibility: registry allows only ${reg.allowedChannels.join('/')}; publisher channels map to ${[...ours].join('/') || 'nothing'}`;
    }
  }
  return null;
}

/** Why a program is not in the queue at all, or null if it is a candidate. */
export function exclusionReason(p: CatalogProgram, reg: RegistryProgram | undefined): string | null {
  if (!p.hasProgram) return `no affiliate program (${p.status || 'dead-end'})`;
  if (p.status && EXCLUDED_STATUSES.has(p.status)) return `catalog status: ${p.status}`;
  if (!p.signupUrl) return 'no official signup URL in the catalog';
  if (reg) {
    switch (reg.relationshipState) {
      case 'approved':
        return 'already approved';
      case 'submitted':
        return 'application already submitted — awaiting decision';
      case 'rejected':
        return 'rejected — wait for the re-apply window';
      case 'deprioritized':
        return 'registry: deprioritized';
      case 'unavailable':
        return 'registry: unavailable';
    }
  }
  return null;
}

function termsFacts(p: CatalogProgram): ApplicationPacket['terms'] {
  return {
    commission: p.commission || 'not stated',
    window: p.recurring || 'not stated',
    cookieDays: p.cookieDays ?? null,
    detail: p.commissionNote || null,
    sourceUrl: p.commissionSourceUrl || p.signupUrl || '',
    verifiedAt: p.commissionVerifiedAt || p.verifiedAt || null,
  };
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** 2–3 sentence pitch. States only declared facts; never quotes earnings, rates, or unverified traffic. */
export function draftPitch(publisher: Publisher, p: CatalogProgram): string {
  const sites = listJoin(publisher.sites.map((s) => s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')));
  const methods = listJoin(publisher.promotionMethods);
  const topic = p.category ? `${p.category.replace(/-/g, ' ')} tools` : 'this category';
  const s1 = `I run ${sites}, covering ${publisher.niche} for ${publisher.audience}.`;
  const s2 = `I'd feature ${p.tool} in ${methods} where it is the honest pick among ${topic}, with an affiliate disclosure on every page.`;
  const facts = publisher.trafficFacts || [];
  const s3 = facts.length
    ? `Current reach: ${facts.map((f) => `${f.statement} (as of ${f.asOf})`).join('; ')}.`
    : `The sites are early, so I'm not quoting traffic figures; I'm glad to share analytics as they grow.`;
  return `${s1} ${s2} ${s3}`;
}

export function prefillFields(publisher: Publisher, p: CatalogProgram): PrefillField[] {
  const [primary, ...rest] = publisher.sites;
  const fields: PrefillField[] = [
    { field: 'Website / primary promotional URL', value: primary?.url || '', tier: 'T1' },
  ];
  if (rest.length) fields.push({ field: 'Additional websites', value: rest.map((s) => s.url).join(', '), tier: 'T1' });
  fields.push(
    { field: 'Niche / content category', value: publisher.niche, tier: 'T1' },
    { field: 'Audience', value: publisher.audience, tier: 'T1' },
    { field: 'Promotional methods', value: publisher.promotionMethods.join('; '), tier: 'T1' },
    {
      field: 'Monthly traffic / audience size',
      value: (publisher.trafficFacts || []).length
        ? publisher.trafficFacts!.map((f) => `${f.statement} (as of ${f.asOf})`).join('; ')
        : 'Leave blank, or answer "new site — pre-traffic". Do not estimate.',
      tier: 'T1',
    },
  );
  const social = publisher.channels.filter((c) => (c.type === 'social' || c.type === 'video') && c.url);
  if (social.length) fields.push({ field: 'Social / video profiles', value: social.map((c) => c.url).join(', '), tier: 'T1' });
  if (publisher.country) fields.push({ field: 'Country', value: publisher.country, tier: 'T1' });
  fields.push(
    { field: 'Why this program (pitch)', value: draftPitch(publisher, p), tier: 'T1' },
    { field: 'Name, email, password, 2FA', value: 'You enter these. The agent never types credentials.', tier: 'T3' },
    { field: 'Tax form, payout / bank details', value: 'You enter these on the network profile.', tier: 'T3' },
    { field: 'Terms of service checkbox + Submit', value: 'You read, accept, and submit.', tier: 'T3' },
  );
  return fields;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- The queue ----------

export function buildJoinQueue(input: {
  catalog: CatalogInput;
  registry: RegistryInput;
  publisher: Publisher;
  eligibility?: EligibilityRule[];
  generatedAt: string;
}): JoinQueue {
  const { catalog, registry, publisher, generatedAt } = input;
  const key = (t: string) => t.trim().toLowerCase();
  const regByTool = new Map(registry.programs.map((r) => [key(r.tool), r]));
  const ruleByTool = new Map((input.eligibility || []).map((r) => [key(r.tool), r]));

  // Shared networks where the publisher already holds a live account (setup already paid).
  const networksWithAccount = new Set<string>();
  for (const p of catalog.programs) {
    const reg = regByTool.get(key(p.tool));
    if (reg && (reg.relationshipState === 'approved' || reg.relationshipState === 'submitted')) {
      networksWithAccount.add(normalizeNetwork(p.network || reg.network));
    }
  }

  const excluded: Excluded[] = [];
  const held: Held[] = [];
  const candidates: { program: CatalogProgram; packet: ApplicationPacket; network: string }[] = [];

  for (const p of catalog.programs) {
    const reg = regByTool.get(key(p.tool));
    const rule = ruleByTool.get(key(p.tool));
    const network = normalizeNetwork(p.network || reg?.network);
    const reason = exclusionReason(p, reg) ?? channelConflict(publisher, reg, rule);
    if (reason) {
      excluded.push({ tool: p.tool, reason });
      continue;
    }
    if (p.status && HOLD_STATUSES.has(p.status)) {
      held.push({ tool: p.tool, network, reason: 'catalog marks this program "verify" — confirm the program and terms before preparing an application' });
      continue;
    }

    const warnings: string[] = [];
    const terms = termsFacts(p);
    if (!terms.verifiedAt) warnings.push('Terms not verified against the official page — re-read them before submitting.');
    if (!reg) warnings.push('Not in the relationship registry — add it there once you apply.');
    else if (reg.relationshipState === 'unverified')
      warnings.push('Registry state is "unverified" — check you do not already have an account before applying.');
    else if (reg.relationshipState === 'application-draft') warnings.push('A draft already exists in the registry — reuse it.');
    if (reg && reg.allowedChannels.length === 0)
      warnings.push('Allowed channels not recorded — confirm blog/web promotion is permitted in the terms.');
    if (p.network && normalizeNetwork(p.network) !== p.network.trim() && /\//.test(p.network))
      warnings.push(`Catalog lists network "${p.network}" — confirm which one the official page uses.`);

    const packet: ApplicationPacket = {
      tool: p.tool,
      network,
      signupUrl: p.signupUrl!,
      registryState: reg ? reg.relationshipState : 'not-in-registry',
      value: programValue(p),
      fields: prefillFields(publisher, p),
      pitch: draftPitch(publisher, p),
      terms,
      warnings,
      humanStep: {
        tier: 'T3',
        text: `Open ${p.signupUrl}, review the prefilled fields, read and accept the terms, click Submit.`,
      },
    };
    candidates.push({ program: p, packet, network });
  }

  const groupsByKey = new Map<string, NetworkGroup>();
  for (const { program, packet, network } of candidates) {
    const shared = SHARED_SETUP_NETWORKS.has(network);
    const groupKey = shared ? network : `${network}: ${program.tool}`;
    let g = groupsByKey.get(groupKey);
    if (!g) {
      const done = shared && networksWithAccount.has(network);
      g = {
        network: groupKey,
        sharedSetup: shared,
        setupCost: shared ? (done ? EXISTING_ACCOUNT_SETUP_COST : NETWORK_SETUP_COST[network]) : PER_PROGRAM_SETUP_COST,
        setupAlreadyDone: done,
        totalValue: 0,
        score: 0,
        setupStep: shared
          ? done
            ? null
            : `Once for all ${network} programs (T3): create your ${network} partner account, verify identity, complete the tax form (W-9 or W-8BEN) and payout profile yourself.`
          : null,
        programs: [],
      };
      groupsByKey.set(groupKey, g);
    }
    g.programs.push(packet);
  }

  const priorityOf = new Map(catalog.programs.map((p) => [p.tool, p.priority ?? Number.MAX_SAFE_INTEGER]));
  const groups = [...groupsByKey.values()];
  for (const g of groups) {
    g.programs.sort(
      (a, b) => b.value.points - a.value.points || priorityOf.get(a.tool)! - priorityOf.get(b.tool)! || a.tool.localeCompare(b.tool),
    );
    g.totalValue = round(g.programs.reduce((s, p) => s + p.value.points, 0));
    g.score = round(g.totalValue / g.setupCost);
  }
  groups.sort((a, b) => b.score - a.score || b.totalValue - a.totalValue || a.network.localeCompare(b.network));

  return {
    generatedAt,
    inputs: { catalogUpdatedAt: catalog.updatedAt, registryUpdatedAt: registry.updatedAt, publisher: publisher.name },
    scoring: [
      `Program value = customer-months: commission rate × commission window (lifetime counted as ${LIFETIME_MONTHS} months; flat bounties ÷ a $${REFERENCE_PLAN_USD}/month reference plan; unpublished rates assumed ${UNKNOWN_RATE * 100}%; terms not yet verified on the official page × ${UNVERIFIED_TERMS_FACTOR}).`,
      'It compares programs against each other. It is not an earnings forecast: price, conversion rate, and traffic are not modeled.',
      `Network score = sum of program values ÷ one-time setup cost (Impact ${NETWORK_SETUP_COST.Impact}, Partnerize ${NETWORK_SETUP_COST.Partnerize}, PartnerStack ${NETWORK_SETUP_COST.PartnerStack}; ${EXISTING_ACCOUNT_SETUP_COST} if you already hold an account there; each direct/per-program portal ${PER_PROGRAM_SETUP_COST}).`,
      'Within a network: highest value first, catalog priority breaks ties.',
    ],
    groups,
    held,
    excluded,
  };
}

/** Flattened queue order: every packet in the order the human should work through them. */
export function queueOrder(q: JoinQueue): ApplicationPacket[] {
  return q.groups.flatMap((g) => g.programs);
}

// ---------- Markdown rendering ----------

export function renderJoinQueueMarkdown(q: JoinQueue, title = 'Affiliate join queue'): string {
  const out: string[] = [];
  out.push(`# ${title} — ${q.generatedAt}`, '');
  out.push(
    `Publisher: ${q.inputs.publisher} · catalog ${q.inputs.catalogUpdatedAt} · registry ${q.inputs.registryUpdatedAt}`,
    '',
    'The agent prepared everything below (T1). Every Submit is yours (T3): the agent never accepts terms, types credentials, fills tax or payout details, or solves a CAPTCHA.',
    '',
    '## How this is ranked',
    '',
    ...q.scoring.map((s) => `- ${s}`),
    '',
    '## Queue',
    '',
    '| # | Network | Program | Value (customer-months) | Network score | Human step |',
    '|---|---|---|---|---|---|',
  );
  let n = 0;
  for (const g of q.groups) {
    for (const p of g.programs) {
      n += 1;
      out.push(`| ${n} | ${g.network} | ${p.tool} | ${p.value.points} | ${g.score} | T3: open, review, accept terms, Submit |`);
    }
  }
  out.push('');

  n = 0;
  for (const g of q.groups) {
    out.push(`## ${g.network} — score ${g.score} (value ${g.totalValue} ÷ setup ${g.setupCost})`, '');
    if (g.setupStep) out.push(`**Network setup — ${g.setupStep}**`, '');
    if (g.setupAlreadyDone) out.push('Account already exists on this network: only the application remains.', '');
    for (const p of g.programs) {
      n += 1;
      out.push(`### ${n}. ${p.tool}`, '');
      out.push(`- **Signup (official):** ${p.signupUrl}`);
      out.push(`- **Registry state:** ${p.registryState}`);
      out.push(
        `- **Value:** ${p.value.points} customer-months (${p.value.rateBasis}; ${p.value.windowBasis})${
          p.value.assumptions.length ? ` — ${p.value.assumptions.join('; ')}` : ''
        }`,
      );
      const t = p.terms;
      out.push(
        `- **Terms:** ${t.commission}; window ${t.window}; cookie ${t.cookieDays ?? 'not stated'}${t.cookieDays ? ' days' : ''}${
          t.detail ? `. ${t.detail}` : ''
        }`,
      );
      out.push(`- **Source:** ${t.sourceUrl} (${t.verifiedAt ? `verified ${t.verifiedAt}` : 'UNVERIFIED — re-read before submitting'})`);
      for (const w of p.warnings) out.push(`- ⚠ ${w}`);
      out.push('', '| Field | Prefill | Tier |', '|---|---|---|');
      for (const f of p.fields) out.push(`| ${f.field} | ${f.value.replace(/\|/g, '\\|')} | ${f.tier} |`);
      out.push('', `**Draft pitch:** ${p.pitch}`, '', `**Your step (${p.humanStep.tier}):** ${p.humanStep.text}`, '');
    }
  }

  if (q.held.length) {
    out.push('## Held — verify before preparing', '');
    for (const h of q.held) out.push(`- **${h.tool}** (${h.network}): ${h.reason}`);
    out.push('');
  }
  if (q.excluded.length) {
    out.push('## Excluded', '');
    for (const e of q.excluded) out.push(`- **${e.tool}**: ${e.reason}`);
    out.push('');
  }
  return out.join('\n');
}
