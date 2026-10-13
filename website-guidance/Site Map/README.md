# Gemu final site map

Simplified team architecture v2, 13 October 2026. Three main pages: Home, Community and Assets. Elmer flagged that the original map had too many pages; this replaces the seven-area page hierarchy. The written brief's areas remain represented as homepage sections and application intents. This is a target architecture; client priorities and implementation depth remain to confirm with Lukas.

Open `index.html` to switch between the hierarchy and user journeys, zoom or print. The SVGs contain editable vector shapes and text, and the PNGs can be pasted directly into a presentation or team chat. Extract the ZIP before opening the viewer. No installation or external dependencies are needed.

## Map conventions

- Site hierarchy: three main pages. Engine, showcase, publishing, Bootcamp and partners are sections on Home.
- User journeys: page/section/detail view = blue; form or confirmation state = amber; external/backend system = green. Labels and line styles carry the same meaning as color.
- Solid arrows = user progression. Dashed arrows = proposed synchronization between systems.
- Confirmation screens are states of the relevant application flow, not extra primary-navigation pages.
- Routes in the diagram and below are proposed implementation paths, not existing deployed URLs.

## Proposed route inventory

| Area | Proposed routes | Notes |
|---|---|---|
| Home | `/` | Engine and showcase; publishing; Bootcamp; investors/licensing. Use section anchors for direct navigation. |
| Community | `/community` | Search/list and an inline discussion panel. Ask/reply as dialogs. A query parameter can identify a topic for sharing. |
| Assets | `/assets` | Browse/search and inline asset detail. Acquisition and creator submissions as dialogs or linked services. A query parameter can identify an asset. |

Request engine access and Submit a game remain distinct form intents, opened from Home, with confirmation inside the dialog. Bootcamp interest and partner enquiries follow the same pattern. Documentation, updates and supporting information use confirmed existing destinations or inline dialogs when relevant, rather than becoming extra hackathon pages.

## Forum and Discord

The proposed bridge pairs one website topic with one Discord forum thread. A hosted bot and backend/database map topics/threads and replies/messages, preserve origin/author labels and prevent echo loops. Only an agreed public support space should be mirrored. Website posting versus read/search only, identity/login, moderation, edits/deletions and recovery require agreement with Gemu. Discord remains an external system, not a child web page.

No login is shown as a mandatory prerequisite for browsing public content. The team must decide whether verified accounts are needed for posting, creator submissions and asset acquisition; do not assume engine-access approval and community membership are the same permission.

## Delivery boundary

The current wireframe v3 now implements three connected static pages in `../Homepage Wireframe/dist/`: Home, Community and Assets. Forms use dialogs; Community and Assets have inline detail. Question/reply updates are local demo data. This compact map preserves client goals while keeping page count down. Priority is still to confirm with Lukas; real access review/delivery, store and Discord integration are not connected. Three pages do not imply that a full store, bot or backend will fit the sprint.

## Sources

- Gemu Company Case Submission.pdf: engine and publishing, three audiences, application funnel, Discord-linked searchable Q&A, Bootcamp, asset marketplace, investment and licensing.
- Gemu intro transcript/slides: homepage as the ecosystem entry point and CRM loop.
- Elmer's clarification: a bot connecting Discord and the website forum, potentially in both directions.
- Existing `../Homepage Wireframe/HANDOFF.md` and source v3: three pages, hero/showcase, homepage ecosystem sections and local application/detail flows. Embark, Landfall and Godot are layout/content pattern references, not factual evidence of Gemu's capabilities.

Client scope/asset questions have been drafted; no response or approval has been supplied in this chat.
