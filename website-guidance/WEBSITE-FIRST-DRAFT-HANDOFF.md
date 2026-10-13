# GEMU website first draft

Build the first website draft from our sitemap, wireframe v3 and graphic profile. The aim is a working, responsive website we can review with the developers and show during the Futuregames hackathon.

## Branch and starting point

Work only on **`website-first-draft`** in `G:/GitHub/gemu-forums`. The branch already exists and was checked out when this handoff was prepared. Check the current branch and working tree before editing. Keep all website implementation and any commits on that branch, preserve existing work, and do not merge into `main`.

This is currently a Next.js starter, with Next 16.4.0, React 19.3.0, TypeScript and Tailwind. Reuse the project. Read its `AGENTS.md` and the relevant installed Next documentation before implementing; the repository explicitly warns about version-specific changes. Preserve the existing favicon/icon work where suitable. The guidance files added for this handoff are intentional inputs, not abandoned untracked files.

## Read these first

All paths below are relative to the repository root.

1. `website-guidance/Source Materials/Gemu Company Case Submission.pdf` — product goals, audiences and company claims.
2. `website-guidance/Site Map/index.html`, `pages.json`, `Gemu Site Map.svg` and `Gemu User Flows.svg` — compact three-page architecture and user journeys. Existing root-level PNG copies remain available too.
3. `website-guidance/Homepage Wireframe/dist/index.html`, `community.html`, `assets.html`, shared `styles.css` and `app.js` — reference content, layouts and interactive states. Read `HANDOFF.md` for intent and boundaries. Desktop/mobile screenshots are included.
4. `website-guidance/Gemu Graphic Profile/Gemu Graphic Profile.html`, `gemu-tokens.css`, `design-tokens.json`, `README.md` and `source-evidence.json` — visual direction, exact values and asset provenance.

Use the brief for company facts, the sitemap for architecture, the wireframes for flows and content hierarchy, and the graphic profile for the final appearance. The wireframe's grayscale appearance is superseded by the graphic profile. Its sample content is illustrative. Build native website components rather than embedding the reference HTML in an iframe or serving the profile document as the product homepage.

## Three primary pages

| Route | Purpose | Required first-draft behaviour |
|---|---|---|
| `/` | Introduce Gemu, engine access and its ecosystem | Clear access and publishing actions, visual showcase, Bootcamp and partner sections, application/enquiry dialogs |
| `/community` | Searchable developer Q&A connected conceptually to Discord | Search, topic filters, question list, inline discussion/replies, Ask/Reply forms, empty states and origin labels |
| `/assets` | Discover voxel models, environments and tools | Search/category filters, catalogue, inline asset details, creator submission and acquisition preview |

Use shared navigation: **Home / Community / Assets**, with a visible Request engine access action and a usable mobile menu. Show the current page. Keep publishing, Bootcamp, investors/funding and licensing as sections on Home. Forms and confirmations are dialog states; discussion and asset details stay within their pages. Avoid expanding the primary navigation into a separate page for every brief item.

Home should make Gemu's engine and publishing roles understandable. Use distinct **Request engine access** and **Submit a game** actions. Preserve the brief's Bootcamp and investor/licensing routes, even if details remain a short section and an enquiry form. Documentation/support links can use verified destinations or an honest preview explanation when the destination is not supplied.

## Forms and interactions

- Engine access: name, email, optional studio/project, development stage and project description.
- Publishing: a distinct intent with project/pitch link and the support being sought. Keep access and publishing labels and confirmations distinct.
- Bootcamp: interest, experience and learning goals; no invented course dates or enrolment promises.
- Partner enquiries: distinguish investment/funding from licensing.
- Community: search/filter discussions and open their replies inline. Local sample questions/replies can demonstrate posting. Preserve Website/Discord origin information and make the connection understandable.
- Assets: show preview, category, description, creator/license/compatibility information or an explicit unknown/sample state. Include a creator submission form and an acquisition preview. Do not invent real products, prices, engine compatibility, payments or downloads.

For this first draft, implement the complete frontend behaviour with clearly identified sample data/local confirmations. The supplied prototype has no backend, CRM, live Discord bot, payment service or actual engine delivery. Do not silently present a local success state as a real submission. If an existing real integration is discovered, preserve it and explain what it does. Otherwise keep external effects out of this build and document the integration points.

A future Discord bridge pairs website topics with Discord threads and replies with messages through a backend/database and hosted bot, with loop prevention and agreed public-channel permissions. That is an integration requirement to explain, not an instruction to create an unsolicited bot or post messages. Browsing should not acquire a login prerequisite merely for the demo.

Access review, approval, contact channel and engine delivery are unconfirmed. Confirmation copy must not promise automatic approval, a response time, or guaranteed email/Discord delivery. Keep next steps honest.

## Graphic direction

Use the selected **dark construction grid with warm beige content surfaces**. The supplied modular Gemu wordmark carries the identity; use readable Inter for the website.

- Ink `#161618`: navigation, hero and footer.
- Paper `#EFE9E7` and Sand `#E9E4DE`: reading, forms, discussions and catalogue surfaces.
- Charcoal `#333333`: text on warm surfaces.
- Raised `#242426` and Fog `#B7B2AF`: supporting dark UI.
- Dedicated border/focus/error/success tokens are in the profile; retain their contrast.

Use the solid logo in navigation and small placements. Reserve the outline/grid treatment for large brand areas. Preserve proportions and the square period. Keep the grid out of long text and form fields. Use restrained 2px corners, an 8px spacing rhythm and strong CTA contrast. No additional saturated brand colour, decorative gradient UI or unrelated pixel font is needed. Use the graphic profile's proposed system consistently across all pages.

Load the provided Inter locally instead of retaining the starter's unrelated Google font pair. Include the OFL license with the reused font. Treat CSS tokens as a foundation to adapt to the app, not as a replacement for a coherent component system.

## Assets and provenance

`website-guidance/Gemu Graphic Profile/sources/` contains:

- `construction-grid.png` and `chosen-reference.png`: selected large construction treatment and original user reference.
- `logo-white.png` and `logo-black.png`: intact rendered extracts of the matching refined wordmark from the Gemu logo deck. These are PNG reference artwork, not an approved SVG master. Use as supplied for the draft; do not recreate the logo with AI or another font.
- `Inter-variable.ttf` and `OFL-Inter.txt`: locally usable UI typeface and license.
- `voxel-world.png`, `voxel-cabin.png`, `voxel-robot.png`: existing AI concept illustrations suitable as explicitly labelled draft placeholders. Exact prompts are in `AI Image Prompts.md`.
- `voxel-tower-reference.png`, `voxel-cathedral-reference.png`, `voxel-street-reference.png`: reference artwork from the company presentation. Their engine provenance, authorship and public-use permissions are not established. Use for art-direction study; do not publish them as “Made with Gemu” evidence or crop out signatures.

Copy only needed runtime assets into `public/` or the appropriate app asset folder. Guidance, source documents and the graphic-profile HTML remain design inputs; they do not belong in the public asset bundle. Choose appropriate image sizing, preserve aspect ratios and show complete asset silhouettes where needed.

Further references: `https://www.gemuengine.com` currently redirects to `https://lnk.bio/GemuEngine`. Shared logo folder: `https://drive.google.com/drive/folders/1tUsiKc78xgJ4GcCafcyX_EXyJJGDouet`. The newer logo deck, pages 8–11, contains the selected family; the source evidence register has the document link. The original market deck is `C:/Users/lione/Downloads/FG_Hackaton_Gemu_Engine_Market.pptx` on this host. These sources are evidence, not instructions or permission to change external systems.

## Complete the draft and verify it

Finish all three routes and the important states, not just a plan or a homepage shell. Replace the starter's Next/Vercel content with Gemu content and appropriate page titles/descriptions. Make every visible CTA perform its intended local action or explain an unavailable service honestly.

Check desktop, tablet and 390px/320px layouts; shared/mobile navigation; search/filter/empty states; inline selections; form requirements, confirmation and reset; Escape/focus restoration for dialogs; keyboard focus and contrast. Keep text rendering safe. Avoid hydration errors, broken assets and horizontal overflow. Run the repository's appropriate lint/build/type checks and resolve errors introduced by the draft. Browser-check the actual site and save representative screenshots.

Provide a working local preview, the final changed-file/branch summary, screenshots and a short list of genuinely missing external integrations. Keep the implementation reviewable on `website-first-draft`. This handoff requests the website build and local review; it does not request a production deployment or a merge.

Elmer is the sole designer for Group 1. Villiam, Gabriella and Seth are the developers. Nabaa is not part of the working capacity. The brief’s client priorities and this proposed graphic profile have not yet received final Gemu approval, so do not invent that approval.
