# DECISIONS.md — Architecture Decisions
*Produced: 2026-06-26*

---

## D1 — Stay vanilla HTML for now, defer Astro migration

**Decision:** Keep the current vanilla HTML + CSS + JS stack through Phases 0–4. Migrate to Astro only after 20+ pages exist.

**Why:** The build spec recommends Astro SSG + Preact islands. That is the right direction for a large site. But the current site has 5 pages and every page is working correctly. The migration cost (learning curve, build tooling, deployment changes, potential regressions in the tax engine) is not justified until copy-paste maintenance becomes an actual bottleneck. At 22+ pages, the cost of maintaining duplicated HTML templates will exceed the migration cost.

**When to revisit:** After Phase 3 (8 new calculators + 9 new province pages).

---

## D2 — No TypeScript extraction yet

**Decision:** Keep tax engine as inline `<script>` in each HTML file for now.

**Why:** The engine is correct, verified, and ~250 lines. Extracting to TypeScript adds a build step, module bundler, and type definitions — none of which provide user-visible value today. Unit tests (Vitest) would add value, but can be added as a standalone test file that imports a plain JS module without TypeScript.

**When to revisit:** Same trigger as D1 (Astro migration). They move together.

---

## D3 — No framework for province page generation

**Decision:** Clone ontario/index.html manually for each new province page.

**Why:** With 9 new province pages, the total cloning effort is ~2 hours and the result is independently editable pages. An SSG templating approach would save time but requires D1 first. Manual cloning is the pragmatic path for Phase 1.

**Template discipline:** Create one canonical template file (`province-template.html`) first, then clone from that — not from an already-modified province page.

---

## D4 — Referral link hardcoded everywhere

**Decision:** https://wealthsimple.com/invite/E7IMSP is hardcoded in all CTAs.

**Why:** The build spec states "hardcode it, do not make it configurable." This is correct — configurability adds attack surface (link substitution) and complicates auditing compliance.

**Implication:** When Wealthsimple changes the invite link (account closure, new program), every HTML file needs updating. Acceptable at this scale. At 20+ pages, a find-replace script or SSG templating (D1) resolves this.

---

## D5 — Light linen theme (not dark mode)

**Decision:** Keep the current warm linen (#F5F2ED) background and forest green (#1D6B3E) accent.

**Why:** The build spec's CLAUDE (2).md originally specified a dark navy theme. The production site evolved to a light theme. The light theme is meaningfully differentiated from BracketBuddy.ca (dark navy), better for legibility of tax tables and numbers, and aligns with the "trustworthy Canadian fintech" brand direction. Switching now would require rethinking every design token and create regression risk.

**If dark mode is requested later:** Implement as a system preference toggle using CSS custom properties — all current tokens are already in `:root` and can be overridden with `@media (prefers-color-scheme: dark)`.

---

## D6 — Cookieless analytics via Cloudflare Web Analytics

**Decision:** When adding analytics (Phase 4), use Cloudflare Web Analytics.

**Why:** Zero cookies, no PII, no consent banner needed, free, single-script, privacy-respecting. Satisfies Hard Guardrail 6 (inputs never sent to server) and works with the current static hosting setup. Plausible is an equally valid alternative but costs money.

**What NOT to use:** Google Analytics, Meta Pixel, or any cookie-based or fingerprinting system.

---

## D7 — Province page URL structure

**Decision:** Use `/ontario/`, `/bc/`, `/alberta/`, `/quebec/`, `/manitoba/`, etc.

**Why:** Short, human-readable, SEO-friendly. Already established for 4 pages. Consistent with Netlify/GitHub Pages directory-based static hosting (each folder has an `index.html`).

**New pages:** `/manitoba/`, `/saskatchewan/`, `/nova-scotia/`, `/new-brunswick/`, `/pei/`, `/newfoundland/`, `/northwest-territories/`, `/nunavut/`, `/yukon/`

---

## D8 — Calculator URL structure

**Decision:** Use `/take-home-pay/`, `/capital-gains/`, `/tfsa/`, etc. (not `/calculators/take-home-pay/`).

**Why:** Shorter URLs, easier to type and share. The site's primary use case IS calculators — no need for a `/calculators/` prefix. The domain maplesavings.ca is already scoped to tax savings, so the namespace is implicit.

---

## D9 — Bilingual scaffold: en-CA first, fr-CA as sibling paths

**Decision:** English pages at root (`/`, `/ontario/`). French pages at `/fr/` prefix (`/fr/`, `/fr/ontario/`).

**Why:** Subdirectory (`/fr/`) is preferred over subdomain (`fr.maplesavings.ca`) for a small site — simpler DNS, same hosting, better consolidated domain authority. hreflang connects the pairs.

**When to implement:** Phase 4. Start with homepage + ontario + one calculator page.

---

## D10 — FHSA contribution room cap

**Decision:** Cap FHSA input at $16,000 (not $8,000).

**Why:** The $8,000 annual cap applies to first-year contributors. Users who opened their FHSA in a prior year and have carry-forward room can contribute up to $16,000 in a single year. The calculator already has a "first year" checkbox to switch between the two caps. This is correct.

**Source:** CRA FHSA rules — annual room $8,000, carry-forward of unused room up to $8,000 additional.

---

## D11 — Revisiting D1: still not a full Astro migration, but the duplication risk is now real and demonstrated

**Decision:** Do not migrate to Astro yet, despite the site now being at ~29 HTML files (past D1's "20+ pages" trigger). Instead, the next time the tax engine is touched, extract `BRACKETS_2025`/`BRACKETS_2024`/`BRACKETS_2026` and the core calc functions (`calcTax`, `calcTotalTax`, `getMarginalRate`, CPP/EI helpers) into one canonical `/js/tax-engine.js` file loaded via `<script src="">` on every page — no framework, no build step, no TypeScript required for this specific fix.

**Why:** This session directly demonstrated the exact failure mode D1 warned about: while building the capital-gains and take-home-pay calculators, a bug was found in `tax-refund/index.html`'s hand-copied CPP parameters (2025 `max1` was using 2024's figure — a $37+ overstatement of CPP for higher earners) that had been live and unnoticed. That happened *within a single build session by one careful editor*; the risk compounds with every new calculator page and every editor (human or agent) who touches this data without cross-checking every other copy. That is a genuine, observed maintenance cost, not a hypothetical one — but it is a duplication problem specifically, not a "we need Astro" problem. A single shared JS file eliminates the duplication risk directly, at near-zero migration cost and zero build-tooling risk, whereas a full Astro migration adds a build step, a new mental model, and deployment changes for a team that currently deploys by hand-editing HTML and pushing to a git-connected Vercel project.

**When to revisit full Astro migration:** If the site outgrows even a shared-JS-file approach — e.g., if templating the ~13 nearly-identical province pages by hand becomes the actual bottleneck (not the tax data, which D11's fix already solves), or if the site adds a French (`/fr/`) version and needs real i18n routing rather than hand-duplicated pages. Neither condition is true yet.
