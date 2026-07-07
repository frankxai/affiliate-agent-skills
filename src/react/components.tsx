'use client';

// The one canonical copy of the content-authoring components every site's mdx-components.tsx
// binds to. Previously hand-copied per repo; disruptivepassiveincome's copy had already
// drifted (missing price-sort in ComparisonTable) before this module existed. Fix once, here,
// so it can't happen again — every site imports the same source instead of a local fork.
//
// Catalog binding is via Context, not a factory function: a factory (`createXComponents(catalog)`
// returning fresh components) can't be called from server code when this module is 'use client' —
// React disallows invoking any export of a client module directly from a server module, even a
// plain function. Rendering a client Component (or passing one as a prop) is fine; calling one
// of its exports as a function is not. Context sidesteps this: the components below are static,
// stable references — CatalogProvider is rendered (not called) in each site's root layout.
import { createContext, useContext, useMemo, useState, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { trackClientEvent, type AnalyticsEvent } from './analytics.js';
import { createAffiliateHelpers, type Catalog } from './catalog-helpers.js';

const CatalogContext = createContext<ReturnType<typeof createAffiliateHelpers> | null>(null);

/** Wrap a site's root layout once: `<CatalogProvider catalog={catalog}>{children}</CatalogProvider>` */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const helpers = useMemo(() => createAffiliateHelpers(catalog), [catalog]);
  return <CatalogContext.Provider value={helpers}>{children}</CatalogContext.Provider>;
}

function useCatalogHelpers() {
  const helpers = useContext(CatalogContext);
  if (!helpers) throw new Error('AffiliateLink/AffiliateDisclosure/ComparisonTable must render inside <CatalogProvider>.');
  return helpers;
}

// --- Components with zero catalog dependency — safe to use directly ---

/** The AEO answer box — a direct, citable answer at the top of a post. Lead with the conclusion. */
export function AnswerBox({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
      <div className="mb-1 text-xs font-semibold uppercase text-accent">The short answer</div>
      <div className="text-[1.05rem] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export type Faq = { q: string; a: string };

/** Renders FAQs and emits FAQPage JSON-LD in one place — wins "People also ask" + AI answers. */
export function FaqSection({ items }: { items: Faq[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="my-8">
      <h2>Frequently asked questions</h2>
      <div className="mt-3 divide-y divide-border rounded-xl border border-border">
        {items.map((f) => (
          <details key={f.q} className="group px-4 py-3">
            <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">{f.q}</summary>
            <p className="mt-2 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  );
}

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent['event'];
  payload?: Omit<AnalyticsEvent, 'event' | 'ts'>;
  children: ReactNode;
};

/** Anchor that fires a same-origin analytics beacon on click before navigating. */
export function TrackedLink({ event, payload, onClick, children, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        trackClientEvent(event, { ...payload, href: props.href });
        onClick?.(clickEvent);
      }}
    >
      {children}
    </a>
  );
}

// --- Components reading the catalog via CatalogProvider ---

export function AffiliateLink({ tool, children }: { tool: string; children?: ReactNode }) {
  const { getLink, findProgram } = useCatalogHelpers();
  const href = getLink(tool);
  const label = children ?? findProgram(tool)?.tool ?? tool;

  if (!href) return <strong>{label}</strong>;

  return (
    <TrackedLink
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="text-accent underline underline-offset-2"
      event="affiliate_click"
      payload={{ tool, source: 'content-affiliate-link' }}
    >
      {label}
    </TrackedLink>
  );
}

/** One per page that carries affiliate links — FTC compliance + trust. */
export function AffiliateDisclosure() {
  const { DISCLOSURE } = useCatalogHelpers();
  return (
    <p className="my-6 rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm text-muted">
      <span className="mr-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent">Disclosure</span>
      {DISCLOSURE}
    </p>
  );
}

type SortKey = 'tool' | 'price';

export type ComparisonRow = {
  tool: string;
  verdict: string;
  price: string;
  recurring?: string;
  pick?: boolean;
};

function Th({ children, onClick, active, asc }: { children: ReactNode; onClick: () => void; active: boolean; asc: boolean }) {
  return (
    <th className="px-4 py-3 font-semibold">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-ink">
        {children}
        <span className="text-[10px] uppercase tracking-[0.14em] opacity-60">{active ? (asc ? 'A-Z' : 'Z-A') : 'Sort'}</span>
      </button>
    </th>
  );
}

/** The money component: an honest, sortable tool table. "Try" only renders when ourLink is set. */
export function ComparisonTable({ rows, caption }: { rows: ComparisonRow[]; caption?: string }) {
  const { getLink } = useCatalogHelpers();
  const [sort, setSort] = useState<SortKey>('tool');
  const [asc, setAsc] = useState(true);

  const sorted = [...rows].sort((a, b) => {
    const cmp = a[sort].localeCompare(b[sort]);
    return asc ? cmp : -cmp;
  });

  const toggle = (key: SortKey) => {
    if (key === sort) setAsc(!asc);
    else { setSort(key); setAsc(true); }
  };

  return (
    <div className="my-7 overflow-hidden rounded-xl border border-border glass">
      {caption && <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-muted">{caption}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-muted">
              <Th onClick={() => toggle('tool')} active={sort === 'tool'} asc={asc}>Tool</Th>
              <th className="px-4 py-3 font-semibold">Verdict</th>
              <Th onClick={() => toggle('price')} active={sort === 'price'} asc={asc}>Price</Th>
              <th className="px-4 py-3 font-semibold">Recurring</th>
              <th className="px-4 py-3 font-semibold">Try</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const href = getLink(r.tool);
              return (
                <tr key={r.tool} className={`border-t border-border ${r.pick ? 'bg-accent/[0.05]' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {r.tool}
                    {r.pick && <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">Top pick</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.verdict}</td>
                  <td className="px-4 py-3 text-ink">{r.price}</td>
                  <td className="px-4 py-3 text-muted">{r.recurring ?? 'None'}</td>
                  <td className="px-4 py-3">
                    {href ? (
                      <a href={href} target="_blank" rel="sponsored nofollow noopener" className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-bg hover:opacity-90">
                        Try
                      </a>
                    ) : (
                      <span className="text-xs text-muted/60">No link</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
