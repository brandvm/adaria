# Adaria Webflow custom code

Versioned custom CSS and JavaScript for https://adaria-ca.webflow.io/.
Migrated from the site's public CodeSandbox assets on September 30, 2026.

## Copy into Webflow

Use the complete contents of these three files. Replace the matching existing Adaria blocks rather than appending another copy. Preserve unrelated tracking or verification code if it has been added separately.

| File | Webflow location |
| --- | --- |
| [webflow/head.html](webflow/head.html) | Site settings → Custom code → Head |
| [webflow/global-embed.html](webflow/global-embed.html) | Shared global-code Embed in Designer, once on every page and CMS template |
| [webflow/footer.html](webflow/footer.html) | Site settings → Custom code → Footer |

The shared Embed contains the full CSS, including the original head utilities and slider thumbnail/disabled-button rules. It replaces both the CodeSandbox CSS link and the small staging style block. Keeping CSS inline makes it available on the Designer canvas and allows direct editing there. There is no second custom-CSS link in the head.

The footer replaces the original unpkg Lenis script, inline Lenis initialization and CodeSandbox JavaScript tag. Lenis initialization now lives in `adaria-main.js`. Keep Webflow's generated runtime, jQuery, GSAP, ScrollTrigger and SplitText enabled; do not copy or delete those generated tags. Keep any unrelated page-specific embeds, scripts and Webflow interactions.

Save all three replacements, publish to the staging domain and check navigation, scrolling, sliders, tabs, thumbnails and the contact form. No Webflow publication is performed by this repository.

## Versioned CDN files

- JavaScript: https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.0.0/adaria-main.js
- CSS: https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.0.0/adaria-main.css
- Lenis: https://cdn.jsdelivr.net/npm/lenis@1.1.5/dist/lenis.min.js
- Swiper: version 11.2.10, loaded by the existing SmartSwiper module only on pages containing matching sliders.

JavaScript uses jsDelivr in the recommended setup. The CSS CDN file is also available, but the full CSS is already in the shared Embed: do not load both copies. If you later choose external CSS, replace the full style block with a link to the CSS URL and test Designer canvas visibility.

Tagged URLs are immutable. For future code changes, create a new release tag and update the script URL in Webflow. Do not overwrite the v1.0.0 tag. If CSS changes in the repository, regenerate or copy the complete CSS into the shared Embed. If you edit CSS directly in Webflow, sync those edits back to the repository before generating another release.

## Migration details

- Preserved the original styles, slider configurations, keyboard shortcut, auto-click behavior and navigation shrinking.
- Consolidated the supplied head and Embed styles into `adaria-main.css` and the complete Designer Embed.
- Retained Lenis 1.1.5 and its original configuration; it now exposes `window.lenis`, matching the existing go-to-top module's lookup.
- Added a guard against double initialization and native-scroll fallback when Lenis/GSAP/ScrollTrigger are unavailable.
- Pinned Swiper to 11.2.10, the version the old `@11` endpoint served at migration time. This is not a slider-library upgrade.
- Preserved original external CSS/JS and original Webflow snippets under `originals/`. Inventoried the 16 publicly linked pages. Webflow-managed HTML, CMS data, media and generated code remain in Webflow; this is not a full site export.

## Validation

- `npm run check`: JavaScript syntax.
- `npm test`: five checks for the Lenis/go-to-top connection, duplicate inclusion, missing dependencies, Webflow editor exclusion and existing-instance reuse.
- Local copies of the published homepage and smart-store page initialized without console errors or CodeSandbox resource requests. The smart-store slider advanced from index 0 to 1 via its next button.
- Final CDN URLs are verified after publishing the tag. Webflow Designer integration and published-site behavior must be checked after the snippets are pasted; no enquiry was submitted.

## Rollback

The original head, footer, shared Embed, CSS and JS are in `originals/`. Restore matching originals together if needed. The original snippets point to CodeSandbox and depend on its availability.
