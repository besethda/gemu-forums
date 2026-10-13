# Gemu three-page wireframe — developer handoff v3

13 October 2026. Elmer is the sole designer; Villiam, Gabriella and Seth are the developers. This is a reviewable prototype based on the written company brief and simplified team sitemap. Client priority and functional depth remain to confirm.

## Architecture

| Page | Content | Interaction |
|---|---|---|
| Home (`index.html`) | Engine and showcase, publishing, Bootcamp, investors/licensing | Access/publishing applications, Bootcamp interest, partner enquiries in dialogs |
| Community (`community.html`) | Searchable questions and website/Discord discussions | Topic/search filters, inline thread detail, local Ask/Reply forms |
| Assets (`assets.html`) | Sample models, environment and tool listings | Category/search filters, inline detail panel, creator submission and acquisition preview |

There are exactly three primary pages. Forms and confirmation screens remain UI states. The prototype uses `.html` filenames for offline sharing; production can map them to `/`, `/community` and `/assets`. Sample detail selection supports `?topic=access` and `?asset=robot` on initial load. Engine/showcase, publishing, Bootcamp and partners remain homepage sections.

## Reference decisions

- Embark: wide image-led introduction and prominent project/media storytelling.
- Landfall: short direct descriptions and clear actions for engine versus publishing intent.
- Godot: understandable engine, community and asset navigation, plus developer support routes.

All images are original AI-generated concept illustrations. No reference company game art, logos, screenshots or copy were reused. Exact image prompts and file mapping are in `IMAGE PROMPTS.md`.

## Applications and follow-up

Request engine access collects name, email, optional studio/project, stage and project description. Submit a game additionally supports a pitch link and required support description. They share a form renderer but preserve separate labels, confirmation copy and intent. The applicant can switch between access and publishing within the dialog.

Bootcamp collects interest and experience rather than inventing enrollment dates or requirements. Investment/funding and licensing have separate enquiry intents. All confirmations explain proposed review/follow-up; they do not promise automatic approval, an email/Discord channel or a response time. Gemu needs to confirm qualification, review ownership and access/onboarding delivery.

## Community

Three sample discussions cover getting started, multiplayer and assets. Origin labels distinguish Website from Discord. Search and topic filters update the list and selected detail. Ask and Reply create in-memory demo entries only; they reset on reload. User-entered text is rendered with textContent rather than interpreted as markup.

Continue in Discord explains the proposed integration instead of posting messages. A working bridge needs a hosted bot, backend/database, website-topic/Discord-thread mappings, reply/message mappings and loop prevention. Confirm designated public channel, identity, posting permissions, moderation, edit/delete sync and recovery with Gemu. Current UI supports browsing without a login assumption; verified posting requirements remain a client decision.

## Assets

Four clearly labelled sample listings use three illustrations. They have no real prices, downloads, model files or asserted compatibility. Details stay inside the page. Acquisition explains the future license/compatibility/payment/delivery step but performs no transaction. Creator submission previews a proposed review flow; it does not publish a listing automatically.

For production, establish asset file formats, license fields, moderation, storage and actual Gemu delivery first. Creator identities and rights need client agreement. A complete marketplace is beyond this local demo.

## Implementation handoff

Buildless HTML/CSS/JS in `dist/`; shared `styles.css` and `app.js`; three media files in `dist/media/`. No third-party dependencies, network writes or persistent browser storage. Native dialogs handle Escape and focus containment. Visible focus styles, labelled controls, current-page navigation and responsive stacking are included. Image thumbnails use contain to show the full asset; the hero and environment media use a landscape composition.

Suggested work packages to agree: page/component shell; applications and follow-up integration; searchable community and optional bot demonstration; sample asset discovery/detail flow. Do not infer assigned ownership from this document.

## Review prompts

1. Can a visitor distinguish engine access, publishing and technical support?
2. Does the access application collect enough information to qualify the project?
3. Does Community make one shared website/Discord discussion understandable?
4. Is the asset detail/acquisition/creator path clear without claiming a live store?
5. Which parts need real behavior for the pitch, and which should stay clearly demonstrated concepts?

## Sources and status

Gemu Company Case Submission.pdf pages 1–3; Gemu intro transcript and slides; homepage holding-page inspection; simplified team sitemap v2. Company capability statements are taken from the brief, not benchmarked. No client approval or real-user research has been supplied. Public Sites hosting remains pending because its native tools are unavailable; prior public authorization persists.
