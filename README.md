# Adaria Webflow custom code

Source and minified builds for https://adaria-ca.webflow.io/.
Current release: **v1.1.0**. Package dependencies and an esbuild build follow the approach used by `brandvm/reformdd`; Webflow continues to own markup, layout, interactions and CMS content.

## Install in Webflow

| File | Webflow location |
| --- | --- |
| [webflow/head.html](webflow/head.html) | Site settings → Custom code → Head |
| [webflow/global-embed.html](webflow/global-embed.html) | Shared global-code Embed, once on every page and CMS template |
| [webflow/footer.html](webflow/footer.html) | Site settings → Custom code → Footer |

Replace the matching Adaria blocks, rather than appending duplicates. Preserve unrelated custom integrations.

**Upgrading from the three v1.0.0 snippets:** only the footer changes. Replace its two script tags with the single tag in `webflow/footer.html`. Remove the separate Lenis script and any old inline Lenis initialization. Head and shared CSS Embed content are unchanged. Publish after replacing the footer.

The complete CSS remains in the shared Embed for Designer canvas visibility and direct editing. No additional custom CSS link is needed. Keep Webflow's generated GSAP, ScrollTrigger, SplitText, jQuery and runtime scripts enabled: those are provided by Webflow and are not duplicated in this bundle.

## Installed dependencies and built assets

`package.json` and `package-lock.json` record dependencies. `node_modules/` is ignored. Run `npm ci` to install the locked packages; GitHub/jsDelivr serve the compiled files under `dist/`, not an installed node_modules directory.

| Output | Contents / loading |
| --- | --- |
| `dist/adaria.min.js` | Minified site logic plus Lenis 1.1.5; one footer script |
| `dist/swiper.min.js` | Installed Swiper 12.1.2; requested only on pages with matching slider markup |
| `dist/swiper.min.css` | Swiper's corresponding CSS, loaded alongside its JS |
| `dist/adaria.min.css` | Minified custom CSS, available for an external-CSS setup |
| `dist/licenses/` | Redistributed third-party license notices |

Swiper URLs resolve relative to the executing Adaria bundle, so they use the same immutable release automatically. There are no separate npm-CDN requests for Lenis or Swiper. esbuild is a development dependency only.

Production URLs:

- https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.1.0/dist/adaria.min.js
- https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.1.0/dist/adaria.min.css

The CSS URL is optional because the recommended shared Embed already contains those rules. Do not load both copies. The full Swiper bundle preserves the existing available modules; it does not load on pages without sliders.

## Develop and build

Node 24 is recorded in `.nvmrc`. Dependencies and esbuild are pinned; the lockfile provides repeatable installs.

```sh
npm ci
npm run check
npm test       # production build + behavior tests
npm run build # regenerate dist/ and the Webflow snippets
npm run dev   # watch + local asset server at http://127.0.0.1:3001
```

Source: `src/index.js` imports Lenis and starts `src/runtime.js`; `src/vendor/swiper.js` builds the separate Swiper files. CSS is authored in `src/styles.css`. The build regenerates the complete shared CSS Embed and versioned footer. If CSS was edited directly in Webflow, sync it back into `src/styles.css` before rebuilding.

The development command serves unminified assets and source maps locally. It does not automatically change Webflow's installed snippets or publish the site. This repository currently uses pinned production snippets rather than Reformdd's GitHub Pages staging/dev switcher.

## Release

Built assets are committed in this repository so a jsDelivr tag always contains its files. The GitHub Actions check installs the lockfile, checks source syntax, builds/tests, and verifies that committed dist/ and Webflow snippets match the source.

1. Update the version in `package.json` and run `npm install --package-lock-only`.
2. Run `npm run check`, `npm test` and browser checks for the affected behavior.
3. Commit source, lockfile, `dist/`, and `webflow/` together.
4. Create and push a new immutable `vX.Y.Z` tag. Never move an already published tag.
5. Verify the new jsDelivr URLs, then update the Webflow footer and any changed Embed content; publish and verify staging.

The previous `v1.0.0` tag remains intact for rollback. Do not use an unversioned or branch URL for production.

## What changed in v1.1.0

- Added installed, locked dependencies and a repeatable minified build.
- Bundled the existing Lenis version with site code, removing a separate script request and ordering dependency.
- Moved Swiper delivery into the same repository release, retaining conditional loading on slider pages.
- Updated Swiper from 11.2.10 to the patched 12.1.2 because the installed-dependency audit identified [GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643). No claim of site exploitation is implied.
- Replaced repeated polling during Swiper loading with one shared load promise, reporting a failed load without an endless polling loop.
- Retained original slider configurations, menu/tabs, CSS, native-scroll fallback, editor exclusion, go-to-top connection and duplicate-init guard.

Validation: source syntax and seven behavior tests passed. Local browser checks confirmed the homepage requests only the main bundle; slider pages request matching vendor files, next-slide navigation advances, hidden tab galleries initialize and thumbnail selection updates the main image. No browser console errors appeared in those checks. `npm audit --omit=dev` reported zero vulnerabilities at release preparation. No Webflow publication or enquiry submission was performed.

Original CodeSandbox assets and supplied snippets remain under `originals/`. Webflow-managed content and generated code remain in Webflow; this is not a full site export.
