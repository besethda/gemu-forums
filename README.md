# Gemu website first draft

Frontend draft on `website-first-draft`, built with the existing Next.js 16.4 / React 19.3 project. Home (`/`), Community (`/community`) and Assets (`/assets`) share responsive navigation, the supplied modular wordmark, local Inter and the proposed dark-grid / warm-surface graphic profile.

The user's follow-up scope supersedes the original handoff's interactive-form and Discord requirements: forms are **inactive visual placeholders**, Community is a **standalone sample forum**, and there is **no backend, email, posting, Discord bridge, payment, download or external submission**. Search, filters and empty states work locally. Community keeps discussion details inline; Assets uses a catalogue and individual `/assets/[assetId]` detail pages. Asset galleries, information tabs and policy accordions work locally. No commits, pushes, deployment or merge were requested.

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
node scripts/verify-browser.mjs
```

The browser script uses an installed `playwright` package, or a package directory supplied in `PLAYWRIGHT_MODULE_PATH`. It expects the local preview to be running; `PREVIEW_URL` overrides its URL. Playwright is supplied by the Codex runtime on the review host and is not a website dependency.

Browser checks write screenshots and reports locally under `review/`, which is excluded from Git. Image-generation prompts are also excluded. The design handoff inputs remain available locally in `website-guidance/`. Runtime artwork is limited to the supplied solid logo, three original AI concepts and four matching capability illustrations; presentation reference artwork with unresolved permissions was not copied into `public/`. The included Inter license is `app/fonts/OFL-Inter.txt`.
