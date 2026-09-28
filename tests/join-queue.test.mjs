// Unit tests for the join queue (src/join-queue.ts → dist/src/join-queue.js). Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildJoinQueue,
  queueOrder,
  programValue,
  normalizeNetwork,
  commissionWindowMonths,
  renderJoinQueueMarkdown,
} from '../dist/src/join-queue.js'

const V = '2026-09-28'
const prog = (tool, extra = {}) => ({
  tool,
  hasProgram: true,
  status: 'active',
  signupUrl: `https://${tool.toLowerCase()}.example/affiliates`,
  commissionVerifiedAt: V,
  ...extra,
})
const reg = (tool, relationshipState = 'not-applied', extra = {}) => ({
  tool,
  relationshipState,
  trackingState: 'missing',
  allowedChannels: [],
  evidence: {},
  ...extra,
})
const blogPublisher = {
  name: 'Test Publisher',
  sites: [{ url: 'https://a.example' }, { url: 'https://b.example' }],
  niche: 'AI tool comparisons',
  audience: 'independent creators',
  channels: [{ type: 'blog' }, { type: 'blog' }],
  promotionMethods: ['comparison articles', 'tutorials'],
}
const build = ({ programs, registry = [], publisher = blogPublisher, eligibility = [] }) =>
  buildJoinQueue({
    catalog: { updatedAt: V, programs },
    registry: { updatedAt: V, programs: registry },
    publisher,
    eligibility,
    generatedAt: V,
  })
const tools = (q) => queueOrder(q).map((p) => p.tool)
const excludedReason = (q, tool) => q.excluded.find((e) => e.tool === tool)?.reason

test('value: rate × window, lifetime capped, flat bounty vs reference plan, unknown rate sinks', () => {
  assert.equal(programValue(prog('A', { commission: '60% lifetime', recurring: 'lifetime' })).points, 14.4)
  assert.equal(programValue(prog('B', { commission: '22% of first 12 months', recurring: '12-month' })).points, 2.64)
  assert.equal(programValue(prog('C', { commission: '$25 flat', recurring: 'one-time' })).points, 1.25)
  assert.equal(programValue(prog('D', { commission: 'Up to $50 + 20% of year-one revenue', recurring: 'year-1' })).points, 4.9)
  assert.equal(programValue(prog('E', { commission: 'Rate not published', recurring: 'n/c' })).points, 0.1)
})

test('value: unverified terms count at half', () => {
  const verified = programValue(prog('A', { commission: '30%', recurring: '12-month' })).points
  const unverified = programValue(prog('A', { commission: '30%', recurring: '12-month', commissionVerifiedAt: undefined })).points
  assert.equal(unverified, verified / 2)
})

test('window and network normalization', () => {
  assert.equal(commissionWindowMonths('3-month').months, 3)
  assert.equal(commissionWindowMonths('one-time (×12 on monthly)').months, 1)
  assert.equal(normalizeNetwork('Impact.com'), 'Impact')
  assert.equal(normalizeNetwork('Partnerize/Impact'), 'Impact')
  assert.equal(normalizeNetwork('direct/network'), 'direct')
  assert.equal(normalizeNetwork(undefined), 'direct')
})

test('exclusion: dead-end, closed, deprioritized, approved, submitted, rejected, unavailable', () => {
  const q = build({
    programs: [
      prog('Dead', { hasProgram: false, status: 'dead-end' }),
      prog('Closed', { hasProgram: false, status: 'closed' }),
      prog('Depri', { status: 'deprioritized' }),
      prog('Approved'),
      prog('Submitted'),
      prog('Rejected'),
      prog('Unavail'),
      prog('Open', { commission: '20%', recurring: '12-month' }),
    ],
    registry: [
      reg('Approved', 'approved'),
      reg('Submitted', 'submitted'),
      reg('Rejected', 'rejected'),
      reg('Unavail', 'unavailable'),
    ],
  })
  assert.deepEqual(tools(q), ['Open'])
  assert.match(excludedReason(q, 'Dead'), /no affiliate program/)
  assert.match(excludedReason(q, 'Depri'), /deprioritized/)
  assert.equal(excludedReason(q, 'Approved'), 'already approved')
  assert.match(excludedReason(q, 'Submitted'), /submitted/)
  assert.match(excludedReason(q, 'Rejected'), /rejected/)
  assert.match(excludedReason(q, 'Unavail'), /unavailable/)
})

test('exclusion: registry channel conflict and eligibility rule; empty allowedChannels only warns', () => {
  const rule = {
    tool: 'VideoOnly',
    qualifyingChannels: ['video', 'social'],
    minAudience: 5000,
    summary: 'video creators only',
    source: 'https://videoonly.example/terms',
    verifiedAt: V,
  }
  const q = build({
    programs: [prog('SocialOnly'), prog('VideoOnly'), prog('Unknown')],
    registry: [reg('SocialOnly', 'not-applied', { allowedChannels: ['social'] }), reg('Unknown')],
    eligibility: [rule],
  })
  assert.deepEqual(tools(q), ['Unknown'])
  assert.match(excludedReason(q, 'SocialOnly'), /allows only social/)
  assert.match(excludedReason(q, 'VideoOnly'), /5,000\+/)
  assert.ok(queueOrder(q)[0].warnings.some((w) => /Allowed channels not recorded/.test(w)))

  // Same rule passes once the publisher has a qualifying channel with evidenced audience...
  const videoPublisher = { ...blogPublisher, channels: [...blogPublisher.channels, { type: 'video', audienceSize: 6000 }] }
  const q2 = build({ programs: [prog('VideoOnly')], publisher: videoPublisher, eligibility: [rule] })
  assert.deepEqual(tools(q2), ['VideoOnly'])
  // ...but not when the audience size is unknown (fail closed).
  const unknownAudience = { ...blogPublisher, channels: [{ type: 'video' }] }
  assert.deepEqual(tools(build({ programs: [prog('VideoOnly')], publisher: unknownAudience, eligibility: [rule] })), [])
})

test('hold: catalog "verify" programs are held, not queued or excluded', () => {
  const q = build({ programs: [prog('Unsure', { status: 'verify' })] })
  assert.deepEqual(tools(q), [])
  assert.equal(q.held[0].tool, 'Unsure')
  assert.equal(q.excluded.length, 0)
})

test('grouping: shared networks group; direct programs each stand alone', () => {
  const q = build({
    programs: [
      prog('PS1', { network: 'PartnerStack', commission: '20%', recurring: '12-month' }),
      prog('PS2', { network: 'PartnerStack', commission: '10%', recurring: '12-month' }),
      prog('Im1', { network: 'Impact.com', commission: '30%', recurring: '12-month' }),
      prog('Im2', { network: 'Partnerize/Impact', commission: '30%', recurring: '12-month' }),
      prog('D1', { network: 'direct', commission: '10%', recurring: '12-month' }),
      prog('D2', { network: 'FirstPromoter', commission: '10%', recurring: '12-month' }),
    ],
  })
  const names = q.groups.map((g) => g.network).sort()
  assert.deepEqual(names, ['FirstPromoter: D2', 'Impact', 'PartnerStack', 'direct: D1'])
  const impact = q.groups.find((g) => g.network === 'Impact')
  assert.deepEqual(impact.programs.map((p) => p.tool), ['Im1', 'Im2'])
  assert.match(impact.setupStep, /tax form/)
})

test('ranking: networks by total value ÷ setup cost; programs by value, priority breaks ties', () => {
  const q = build({
    programs: [
      // Impact: 3.6 + 3.6 = 7.2 / 3 = 2.4
      prog('ImA', { network: 'Impact', commission: '30%', recurring: '12-month', priority: 2 }),
      prog('ImB', { network: 'Impact', commission: '30%', recurring: '12-month', priority: 1 }),
      // PartnerStack: (2.4 + 1.2) / 2 = 1.8
      prog('PsLow', { network: 'PartnerStack', commission: '10%', recurring: '12-month' }),
      prog('PsHigh', { network: 'PartnerStack', commission: '20%', recurring: '12-month' }),
      // direct: 14.4 / 1
      prog('Dir', { network: 'direct', commission: '60%', recurring: 'lifetime' }),
    ],
  })
  assert.deepEqual(
    q.groups.map((g) => [g.network, g.score]),
    [['direct: Dir', 14.4], ['Impact', 2.4], ['PartnerStack', 1.8]],
  )
  assert.deepEqual(tools(q), ['Dir', 'ImB', 'ImA', 'PsHigh', 'PsLow'])
})

test('ranking: an existing account on a shared network drops its setup cost', () => {
  const programs = [
    prog('Have', { network: 'PartnerStack' }),
    prog('Next', { network: 'PartnerStack', commission: '20%', recurring: '12-month' }),
    prog('Im', { network: 'Impact', commission: '20%', recurring: '12-month' }),
  ]
  const fresh = build({ programs: programs.slice(1) })
  const fresh2 = fresh.groups.find((g) => g.network === 'PartnerStack')
  assert.equal(fresh2.setupCost, 2)
  const withAccount = build({ programs, registry: [reg('Have', 'approved')] })
  const ps = withAccount.groups.find((g) => g.network === 'PartnerStack')
  assert.equal(ps.setupCost, 1)
  assert.equal(ps.setupAlreadyDone, true)
  assert.equal(ps.setupStep, null)
  assert.equal(ps.score, 2.4)
})

test('packet: official URL, T3 human step, terms with source + date, honest pitch', () => {
  const q = build({
    programs: [
      prog('Tool', {
        category: 'video',
        commission: '20%',
        recurring: '12-month',
        cookieDays: 30,
        commissionSourceUrl: 'https://tool.example/terms',
        commissionNote: 'paid monthly',
      }),
    ],
  })
  const p = queueOrder(q)[0]
  assert.equal(p.signupUrl, 'https://tool.example/affiliates')
  assert.equal(p.humanStep.tier, 'T3')
  assert.match(p.humanStep.text, /^Open https:\/\/tool\.example\/affiliates, review the prefilled fields, .*click Submit\.$/)
  assert.deepEqual([p.terms.sourceUrl, p.terms.verifiedAt], ['https://tool.example/terms', V])
  const sentences = p.pitch.split(/(?<=\.)\s+/)
  assert.ok(sentences.length >= 2 && sentences.length <= 3, p.pitch)
  assert.doesNotMatch(p.pitch, /[$%]|earn|income|guarantee/i)
  assert.match(p.pitch, /not quoting traffic/)
  assert.ok(p.fields.filter((f) => f.tier === 'T3').some((f) => /credentials/.test(f.value)))
  const traffic = p.fields.find((f) => /traffic/i.test(f.field))
  assert.match(traffic.value, /Do not estimate/)
})

test('packet: unverified terms and missing registry entry are flagged', () => {
  const q = build({ programs: [prog('Loose', { commissionVerifiedAt: undefined })] })
  const w = queueOrder(q)[0].warnings.join(' ')
  assert.match(w, /not verified/)
  assert.match(w, /Not in the relationship registry/)
  assert.equal(queueOrder(q)[0].registryState, 'not-in-registry')
})

test('example run on the synthetic registry renders markdown + JSON-safe output', () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
  const q = buildJoinQueue({
    catalog: read('../data/programs.json'),
    registry: read('../examples/join-queue/registry.example.json'),
    publisher: read('../examples/join-queue/publisher.example.json'),
    eligibility: read('../data/program-eligibility.json').rules,
    generatedAt: V,
  })
  assert.ok(queueOrder(q).length > 0)
  assert.equal(excludedReason(q, 'ElevenLabs'), 'already approved')
  assert.match(excludedReason(q, 'HeyGen'), /eligibility/)
  const md = renderJoinQueueMarkdown(q)
  assert.match(md, /## Queue/)
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(q)))
})
