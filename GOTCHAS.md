# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Entries tagged `Scope: template-candidate` are harvested across all client
repos to improve `brandvm/wf-template`.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-09-30 · Local CSS edits never reach the Designer canvas
- Area: designer
- Scope: template-candidate
- Symptom: A CSS change made in `src/styles.css` with `npm run dev` running
  does not show in the Designer.
- Cause: The shared Embed links only the pinned jsDelivr release
  (`webflow/global-embed.html`); the dev server on 127.0.0.1:3001 is not
  referenced anywhere in Webflow (README "Develop and build").
- Fix: none in this repo. Verify CSS locally in a browser, then release a
  new tag and update the Embed link to see it on the canvas — or move the
  change into the Designer, which is usually where it belongs.
- Status: open
- Found by: human

### 2026-09-30 · Full CSS was duplicated inline in the shared Embed
- Area: css
- Scope: project
- Symptom: The v1.1.0 build generated a ~488-line `<style>` Embed copy of
  `src/styles.css`, so CSS lived in two places and drifted if edited in
  Webflow.
- Cause: `build.mjs` wrote the whole stylesheet into
  `webflow/global-embed.html` for canvas visibility (557bb08).
- Fix: 1d919c5 replaced it with a `<link>` to the versioned
  `adaria.min.css`; remove any old inline `<style>` block in Webflow so CSS
  loads once.
- Status: fixed 1d919c5
- Found by: human

### 2026-09-30 · "Staging-only" Embed styles were really production CSS
- Area: css
- Scope: project
- Symptom: `originals/global-embed.html` carried slider-state rules under a
  comment saying they were "for testing in staging only".
- Cause: Studio left live rules (`.swiper-button-disabled`, `.vending-thumb`
  / `.epic-thumb` opacity) in a temporary Embed block.
- Fix: migrated verbatim to the end of `src/styles.css`, as were the head
  `<style>` rules (badge hiding, Lenis classes). Do not delete them as dead
  code.
- Status: fixed 966e6d1
- Found by: human

### 2026-09-30 · Separate Lenis script and inline initializer depended on order
- Area: js
- Scope: project
- Symptom: The original footer loaded Lenis from unpkg, then an inline
  initializer, then the CodeSandbox script (`originals/footer.html`).
- Cause: Three tags with implicit ordering and a global `lenis`.
- Fix: Lenis 1.1.5 is bundled into `adaria.min.js` with the same options;
  remove the old Lenis tag and inline init when installing v1.1.0+.
- Status: fixed 557bb08
- Found by: human

### 2026-09-30 · Swiper 11 flagged by advisory; polling loader replaced
- Area: js
- Scope: project
- Symptom: The installed-dependency audit flagged Swiper 11.2.10
  (GHSA-hmx5-qpq5-p643); Swiper loading polled repeatedly.
- Cause: Floating Swiper URL in the inherited code; loader waited by polling.
- Fix: Swiper 12.1.2 bundled and loaded from the same tag only on slider
  pages, through one shared load promise that reports failure (README "What
  changed in v1.1.0"). Slider configurations were kept.
- Status: fixed 557bb08
- Found by: human

## Known from previous projects

Inherited from `wf-template`; only the entries that apply to this
repo's architecture are copied. Found across earlier client repos; listed so
they are not rediscovered. Status refers to the template.

### 2026-10-02 · Root font-size scale drifts from Designer tokens
- Area: css
- Scope: template-candidate
- Symptom: Designer variables named for px values ("Max Width - 1280px")
  render at different sizes; the scale is retuned again and again.
- Cause: The §01 fluid scale sets `:root` font-size, so every rem/em value
  coming out of the Designer scales with it. reformdd retuned it seven times
  (1680 → 1440 → 1680 → clamp → revert → 1920 → 1440); threestars found em
  layout tokens rendering 6.25% short.
- Fix: none general. Agree the scale with the designer before building, or
  drop it and let Webflow variables own sizing.
- Status: open
- Found by: human

### 2026-10-02 · Renaming a Webflow variable silently breaks repo CSS
- Area: css
- Scope: template-candidate
- Symptom: A container cap or token-driven value quietly stops applying.
- Cause: Container/Max Width was renamed to Section/Max Width in Webflow.
  Webflow rewrites its own references but cannot reach this bundle, so
  `var(--_layout---container--max-width, none)` fell back to `none`
  (reformdd 1ca59f6).
- Fix: avoid referencing Webflow variable names in repo CSS; if one is
  needed, log it here so renames get checked.
- Status: open
- Found by: human

### 2026-10-02 · VER lives in two snippets and a placeholder 404s at launch
- Area: release
- Scope: template-candidate
- Symptom: Prod CSS and JS both 404 the moment a custom domain is attached.
- Cause: `VER = "X.Y.Z"` is never exercised on `*.webflow.io`, and a release
  must bump VER in both the Embed and the footer snippet.
- Fix: regenx keeps one `RELEASE` value in the head config (`null` until the
  first tag) that the other snippets read.
- Status: open
- Found by: human
