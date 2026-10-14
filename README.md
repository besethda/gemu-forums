# Gemu website first draft

Frontend draft on `website-first-draft`, built with the existing Next.js 16.4 / React 19.3 project. Home (`/`), Community (`/community`) and Assets (`/assets`) share responsive navigation, the supplied modular wordmark, local Inter and the proposed dark-grid / warm-surface graphic profile.

The user's follow-up scope supersedes the original handoff's interactive-form and Discord requirements: forms are **inactive visual placeholders**, Community is a **standalone forum preview with fictional conversations**, and there is **no backend, email, posting, Discord bridge, payment, download or external submission**. Search, filters and empty states work locally. Community opens discussions in a sliding drawer from the screen’s right edge; Assets uses a catalogue and individual `/assets/[assetId]` detail pages. Asset galleries, information tabs and policy accordions work locally. No commits, pushes, deployment or merge were requested.

## Local preview

```sh
npm ci
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`. For development, use `npm run dev`.

## Supabase

The catalogue is moving to Supabase (tables: `categories`, `creators`, `assets`).

1. Copy `.env.example` to `.env.local` and fill in the project URL, publishable key and project ID from the Supabase dashboard.
2. Generate TypeScript types from the schema (first time only: `npx supabase login`):

   ```sh
   npm run db:types
   ```

   Re-run it whenever the tables change.

Use `createClient` from `lib/supabase/server.ts` in Server Components, Server Actions and Route Handlers, and from `lib/supabase/client.ts` in Client Components.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Browser verification scripts are kept locally in `review/scripts/`, excluded from Git, ESLint and TypeScript checks. They are optional development tools and are not part of the production website. They use the Codex runtime's Playwright package through `PLAYWRIGHT_MODULE_PATH`, with `PREVIEW_URL` pointing to the running preview. Playwright is not a website dependency.

Browser checks write screenshots and reports locally under `review/`, which is excluded from Git. Image-generation prompts are also excluded. The design handoff inputs remain available locally in `website-guidance/`. Runtime artwork includes the supplied solid logo, three original AI concepts, four matching capability illustrations and five user-supplied engine screenshots. The original screenshot PNGs are preserved in `website-guidance/Gemu Graphic Profile/sources/`. The homepage uses `mountain-third-person.webp` for its hero, `world-overview-2.webp` and `floating-blocks.webp` for its creator showcase, and `editorscreen.webp` for Bootcamp. `world-overview.webp` is available for future use. The included Inter license is `app/fonts/OFL-Inter.txt`.

## Performance

Runtime images in `public/gemu/` use WebP: scenery and illustrations were encoded at quality 90, with logos and the editor screenshot encoded losslessly. Original dimensions and transparency are preserved. The initial nine files total 871 KB, down from 12.6 MB of PNGs; the five added engine screenshots total 740 KB, down from 5.85 MB. Keep `next/image` enabled: it still resizes images for the device and lazy-loads images below the fold. Source-file savings are separate from browser-download savings because Next.js already served optimized versions of the PNGs.

Image `sizes` hints follow the CSS container widths, grid gaps and breakpoints, including the 1200px content limit. Update these hints when changing those layouts. The hero and main asset preview retain their existing preloads.

Inter is served as WOFF2 with all original glyphs and variable-font axes retained; the TTF remains as the source. Preview dialogs and the legacy `?asset=` detail view load their JavaScript on demand. The homepage remains a Server Component, and the production build prerenders the main pages.

The full-width demolition demo below the engine features uses `public/gemu/demolition-demo.mp4` and a 27 KB WebP poster. It shows the first 60 seconds of the source at 2× speed as a 30-second, 1280×772, 30 fps clip. H.264 CRF 28 encoding with no audio and MP4 fast-start reduces the review export from 10.3 MB to 3.45 MB. The video source is assigned only when playback is needed, so the MP4 does not download at the top of the page. Playback is muted, starts when at least 25% of the player is visible, and pauses offscreen or when the tab is hidden. Explicit pause remains in effect after scrolling back. Reduced-motion and available data-saving preferences use manual Play instead of autoplay.

The local `review/scripts/verify-engine-demo.mjs` checker covers desktop/mobile sizing, deferred downloads, autoplay, pause/play, preference changes and hidden-tab behavior. It uses the same `PLAYWRIGHT_MODULE_PATH` and `PREVIEW_URL` overrides as the other local browser checks.

A local production comparison of the original concept-image homepage, before the engine screenshots were added, measured initial resource response bodies at device pixel ratio 1 (including visible-link prefetches, excluding HTML):

| Viewport | Before | After | Reduction |
| --- | --- | --- | --- |
| 390px | 769 KB | 576 KB | 25% |
| 1440px | 830 KB | 612 KB | 26% |
| 2560px | 952 KB | 612 KB | 36% |

These are byte measurements, not load-time or Lighthouse scores. Recheck the deployed site with mobile Lighthouse/PageSpeed Insights to measure LCP, CLS and interaction performance under realistic network and CPU conditions. Local measurements and screenshots are stored in `review/`.
