# Gemu three-page wireframe v3

Updated 13 October 2026 from the simplified sitemap: Home, Community and Assets. Extract `Gemu Wireframe v3.zip` and open `dist/index.html`. The three pages share navigation and local dialogs. No installation/build is needed. All images, styles and scripts are included locally.

## Pages

- `dist/index.html`: engine introduction and showcase, publishing, Bootcamp and investors/licensing sections. Distinct access and pitch forms; interest and partner enquiries as dialogs.
- `dist/community.html`: search/topic filters, inline discussion panel, sample website/Discord origin labels, local Ask and Reply forms.
- `dist/assets.html`: search/category filters, four sample listings, inline asset detail, acquisition explanation and creator submission dialog.

## What works in the demo

Forms validate required fields and email/URL formats, show intent-specific local confirmations, and clear form input when closed. Community questions and replies update the current page's sample data only and disappear after reload. Asset detail opens inside its page; category and search filters include empty states. Main navigation and mobile menus connect all three pages.

Optional starting states: `community.html?topic=access` and `assets.html?asset=robot`. Query parameters select sample records only; they are not production routes or persistent user data.

## Images

Three original illustrations generated with the built-in image tool and copied into `dist/media/`: voxel world, cabin kit and utility robot. They are clearly labelled concepts/sample content. They are not Gemu engine screenshots, real customer games, downloadable model files or real marketplace products. Exact prompts: `IMAGE PROMPTS.md`.

## Handoff and limits

Start with `HANDOFF.md` for section/component mapping, behaviors, priorities and integration questions. The target sitemap remains in `../Site Map/`. Client priorities and detailed implementation depth remain unconfirmed. No backend, login, live bot, CRM, Google Forms/Sheets, email sending, payments, asset download or engine delivery has been connected. No personal data leaves the demo and no browser persistence is used.

Screenshots: opening/full-page/mobile previews for Home, Community and Assets. V1/v2 ZIPs are retained as earlier snapshots; current source is v3. Private process/build/QA files remain in `.build/` and are excluded from the handoff ZIP.

## Public hosting

Public Sites publication was previously authorized. Sites native tools are still unavailable in this chat. No Site is registered and no public URL exists. Only `dist/` should be served when supported publishing becomes available; keep concept/demo disclosures visible. No additional publication confirmation is needed.

Local HTTP preview, if desired: `python -m http.server 4313 --bind 127.0.0.1 --directory dist`. The owned QA server is stopped after verification.
