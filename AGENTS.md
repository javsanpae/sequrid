# AGENTS.md

Onboarding for AI coding agents (and humans) working on **Sequrid**. Read this before you change anything. [`README.md`](README.md) is the user-facing documentation and [`CHANGELOG.md`](CHANGELOG.md) is the history.

## What this project is

Sequrid is a static Svelte 5 + TypeScript web app that protects a photo of an ID card before you send it. It covers sensitive fields (black, pixelated or blurred), adds a tiled diagonal watermark (use · recipient · date) and exports an A4 PDF or JPGs. It supports the Spanish DNI (2021 model), the French carte nationale d'identité (since 2021) and the Italian CIE 3.0 (current design, since 2022), the UK photocard driving licence (Great Britain and Northern Ireland) and the US passport card, up to two IDs (front and back each), in English, Spanish, French and Italian.

It ships as an nginx container image (`ghcr.io/javsanpae/sequrid`) and a Helm chart. Licensed **AGPL-3.0-or-later** ([`LICENSE`](LICENSE)).

## Non-negotiable principles

These come before any feature request. If a task conflicts with them, stop and say so.

- **100% client-side.** There is no backend, no API, no database and no upload. The server only delivers static files. Photos are decoded with `createImageBitmap` (falling back to `<img>`), drawn on a `<canvas>` and exported with `canvas.toBlob`.
- **Nothing is stored.** Photos and settings live only in memory; a reload starts from scratch. The only `localStorage` keys are `sequrid-theme` (light/dark, written in `src/components/Header.svelte`) and `sequrid-language` (`LANG_STORAGE_KEY` in `src/lib/i18n/lang.ts`), which only exists when the user picked a language different from the browser's (absent = automatic). The legacy `sequrid-lang` key from 0.3.0 is removed on load. Both are read before first paint by `public/theme-init.js`. Do not add more persisted state.
- **No network, ever.** [`nginx/security-headers.conf`](nginx/security-headers.conf) sends a strict CSP: `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; manifest-src 'self'; connect-src 'none'; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`, plus `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, COOP/CORP `same-origin` and a restrictive `Permissions-Policy`. So:
  - no `fetch`/XHR/WebSocket/beacons, no analytics or telemetry, no error reporting services;
  - no external fonts, CDNs, images or scripts (system font stacks only, see `--font`/`--mono` in `src/app.css`);
  - no inline `<script>` (that is why `public/theme-init.js` is a file), no web workers;
  - **no runtime dependencies**: `package.json` has only `devDependencies`, and the PDF writer is our own (`src/lib/pdf.ts`). Keep it that way.
  - `vite.config.ts` disables the module preload polyfill because it would use `fetch()`.
  - The e2e test *"only loads its own static files and never talks to anyone while working"* must keep passing.
- **Exports carry no metadata.** Drawing to a canvas drops EXIF/GPS; `buildPdf` writes no Info dictionary (tested in `tests/unit/pdf.test.ts`). Do not add metadata to PDFs or JPGs.
- **AGPL network-use compliance.** The "Source code" links in the header and footer come from `SOURCE_URL` in `src/lib/config.ts` (`VITE_SOURCE_URL`, set from the `SOURCE_URL` Docker build arg; default `https://github.com/javsanpae/sequrid`). Never remove or hide them.
- **Never use real personal data.** Samples are fictitious cards drawn on a canvas in `src/lib/sample.ts`, following each document's layout with made-up data, a "specimen" mark and **no official emblems or artwork**. Do not commit real ID photos, scans or real people's data in code, tests or fixtures.

## Repository conventions

- **Language:** English for code, comments, docs, commit messages and PRs. Commit subjects are imperative and concise (e.g. "Add a country picker and support for the French ID card (0.2.0)").
- **UI copy only through i18n.** No user-visible string in components or `lib` code: everything comes from the dictionaries in `src/lib/i18n/`. `en.ts` is the source of truth; `es.ts`, `fr.ts` and `it.ts` are typed as `Messages` (`typeof en`) and must have the identical shape (same keys, functions stay functions, same array lengths), enforced by `tests/unit/i18n.test.ts`.
- **Typography in dictionaries:** typographic quotes and apostrophes (`“ ”`, `’`, `«  »` in es/fr). French puts a no-break space (U+00A0) before `:` `;` `?` `!` `%` and inside `« »`. `tests/unit/i18n.test.ts` fails on a regular space before `? ! : ; » %` (after a digit) or after `«`, and on a straight apostrophe between letters in any language (outside `` `code` ``).
- **Svelte 5 runes only** (`$state`, `$derived`, `$derived.by`, `$effect`, `$props`, `$bindable`). No legacy `export let`, stores or `$:`.
- **TypeScript strict** (`tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, so use `import type` for types). `npm run check` runs `svelte-check --fail-on-warnings`: it must report **0 errors and 0 warnings** (Svelte a11y warnings included).
- **Accessibility:** everything works with the keyboard and has a visible focus (`:focus-visible` and the `--focus` token in `src/app.css`). Follow the existing patterns:
  - `CountrySelect.svelte`: button with `aria-haspopup="listbox"` opening a popover with a `role="combobox"` search box (`aria-autocomplete="list"`, `aria-activedescendant`, focus stays in the input), a `role="listbox"` with `role="group"` per country and `role="option"` items; ArrowUp/Down wrap, Home/End, Enter picks, Escape clears the query then closes, Tab closes; a polite live region announces the result count.
  - `LanguageSelect.svelte`: `aria-haspopup="menu"` button, `role="menu"` with `menuitemradio` + `aria-checked`, arrow/Home/End navigation, Escape and outside click close, focus returns to the trigger.
  - The editor canvas supports Tab through zones, arrows to move, Shift+arrows to resize, Delete to remove. Status messages go to a `role="status"` region.
- **Design tokens** live on `:root` in `src/app.css` (colors, `--radius`, `--shadow`, `--focus`, fonts). Dark theme values are duplicated in `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` and `:root[data-theme='dark']`: change both. Use tokens, not literal colors, in components.
- **Mobile first:** check narrow screens; there must be no horizontal overflow (e2e asserts `scrollWidth <= innerWidth` on desktop and Pixel 7, also with the picker open). Mobile has a sticky download bar.

## Architecture

```
index.html                 entry; loads /theme-init.js, then src/main.ts
public/theme-init.js       applies saved theme and language before first paint (mirrors detectLang)
public/manifest.webmanifest, favicon.svg, robots.txt
src/main.ts                syncDocument() then mounts App
src/App.svelte             page layout, paste/drop handling, footer (source link, version)
src/app.css                design tokens, light/dark themes, global styles
src/lib/
  config.ts                SOURCE_URL and VERSION from VITE_SOURCE_URL / VITE_APP_VERSION
  documents.ts             document models: ZoneKey, DocumentType, DNI_ES, CNI_FR, CIE_IT, DL_GB, DL_NI, PPC_US, CUSTOM_DOC, DOCUMENTS, CATALOG, helpers
  countries.ts             country names via Intl.DisplayNames, native language/name (cached)
  document-search.ts       picker grouping by country and accent-insensitive search
  presets.ts               usage presets (what each use covers) and protection level
  help-lines.ts            official identity-theft help services by country (data; texts in i18n)
  state.svelte.ts          AppState (runes): faces, zones, frame, settings, status
  files.ts                 load files into slots, file picker, sample loading
  image.ts                 decode (EXIF orientation), downscale, canvas helpers, download
  geometry.ts              Rect math: clamp, move, resize handles, rotation, toPixels
  render.ts                renderOriginal / renderProtected (crop, cover, grayscale, watermark)
  effects.ts               pixelate, box blur, grayscale on RGBA buffers (canvas-free)
  watermark.ts             watermark text and tiling geometry
  pdf.ts                   A4 layout and minimal PDF writer embedding JPEGs
  export.ts                PDF / JPG downloads with localized file names
  sample.ts                fictitious sample cards drawn on canvas
  i18n/
    en.ts                  English messages, source of truth; exports `Messages`
    es.ts, fr.ts, it.ts    translations typed as Messages
    lang.ts                Lang, LANGUAGES, DICTIONARIES, browserLang, detectLang, preferenceFor, isLang (pure)
    index.svelte.ts        reactive current language: m(), getLang(), setLang(), syncDocument()
    text.ts                pure helpers: docText, zoneText, zoneLabel, faceTitle, modelYears, downloadBase…
src/components/
  Header.svelte            nav, theme toggle, language menu, source link
  LanguageSelect.svelte    language menu (menuitemradio)
  Slots.svelte             photo slots per ID, country picker, second-ID switch, sample button
  CountrySelect.svelte     country/document combobox with search
  Flag.svelte              simplified drawn flags, ISO-code badge fallback
  Editor.svelte            toolbar (view, tool, zoom, rotate), drop zone, hints
  Stage.svelte             editing canvas: zones, drawing, framing, keyboard
  Compare.svelte           before/after slider
  Settings.svelte          usage, cover checkboxes/style, watermark, protection level, downloads
  Info.svelte              "what to cover", usage table, privacy, FAQ
  Rich.svelte              renders dictionary markup without {@html}
  Icon, Segmented, Toggle, Thumb   small UI primitives
tests/unit/                Vitest, pure logic
e2e/app.spec.ts            Playwright, desktop + mobile
nginx/                     default.conf (server) and security-headers.conf (CSP etc.)
charts/sequrid/            Helm chart
.github/                   ci.yml workflow, dependabot.yml
VERSION                    release version, single source of truth
```

### Data flow

1. **Load:** `files.ts` `loadFiles()` → `image.ts` `loadImageFile()` decodes with `createImageBitmap(file, { imageOrientation: 'from-image' })` (EXIF orientation applied), downscales to `MAX_SOURCE_SIDE = 2800` px and draws into a canvas (metadata gone). HEIC and non-images raise `UnsupportedImageError` with a reason that maps to `errors.*` messages.
2. **State:** `app.setFace()` stores a `Face` `{ image, rotation, frame, zones }` in `app.faces[d1f|d1b|d2f|d2b]`. Automatic zones come from `defaultZones(doc, side)`; hand-drawn zones have `key: null`.
3. **Render:** `render.ts` `renderProtected(face, settings, maxWidth)` rotates the image (cached per canvas), crops the frame, then for each visible zone fills black or runs `coverBuffer` (pixelate, or pixelate + 3-pass box blur, with block sizes from `coverStrength` so text cannot be reconstructed), then optional grayscale, then the watermark.
4. **Export:** `export.ts` renders each face at `EXPORT_WIDTH = 2000` px, encodes JPEG (quality 0.92), then `pdf.ts` `layoutPages()` (`real`: 85.6 mm wide, 2 columns; `large`: 170 mm, 1 column; A4, 20 mm margins) and `buildPdf()`. JPG exports are one face or a white sheet with all faces. File names come from `downloadBase` / `faceFileName` in the current language.

`app.visibleZones(face)`: hand-drawn zones always apply; automatic zones only in `auto` cover mode and when their checkbox (`app.selection[key]`) is on. Removing an automatic zone unticks its field.

### Coordinate systems

- **Document rects** (`SideRect` in `documents.ts`): fractions (0..1) of the card's width/height on one side.
- **Zone rects** (`ZoneInstance.rect`): normalized to the **card frame**, so they follow the frame when the user re-frames.
- **Frame** (`Face.frame`): normalized to the **rotated image**. Rotating resets it to `FULL_RECT`.
- `geometry.ts` `toPixels()` converts to pixels covering every touched pixel.

### Document model

- `ZoneKey` is a **shared vocabulary across countries** (`number`, `serial`, `birthDate`, `signature`, `can`, `expiry`, `issueDate`, `name`, `photo`, `address`, `birthPlace`, `parents`, `height`, `seal`, `taxCode`, `birthRecord`, `issuer`, `entitlements`, `restrictions`, `mrz`) so presets work for every document. `ZONE_KEYS` order is the display order for mixed-country checklists.
- A `DocumentType` has `id` (`DocumentId` union), `country` (ISO 3166-1 alpha-2), `short` (acronym used in labels and file names), `issuedFrom`, optional `issuedUntil` (absent = still issued), optional `aliases` (search terms), `widthMm`/`heightMm` (ID-1) and `zones`, each with one or more rects on either side (repeated prints of the same data are extra rects of the same key).
- `documents.ts` holds **only geometry and identifiers**; display text lives in `t.documents[id]` (`countryName`, `name`, `sides`, per-document `zones` label/hint). `t.fields` holds neutral names used when countries are mixed.
- **Custom document** (`CUSTOM_DOC`, `custom: true`, pseudo-country `CUSTOM_COUNTRY = 'ZZ'`, ISO user-assigned): no zones, no years; its name comes from the dictionary (`documents.custom.countryName`), never from Intl. The picker lists it last and offers it when a search finds nothing; it is the **default** for both IDs (`app.docTypes` in `state.svelte.ts`); choosing it (or loading a face of it) switches the tool to Draw; when only custom documents are in use `protectionSummary` returns `drawn: true` and judges the drawn zones. `CATALOG` is `DOCUMENTS` without it: catalog tests and the help-line coverage test iterate `CATALOG`.
- The picker (`document-search.ts`) groups by country (sorted by localized name with `Intl.Collator`; models current first, then newest via `compareModels`) and searches case- and accent-insensitively: every query word must prefix-match a word among country names (all UI languages, native name, ISO code), acronym, model names (all UI languages), aliases and years; a 4-digit year also matches models issued that year. Country names come from `Intl.DisplayNames` (`countries.ts`), falling back to the dictionary `countryName`, then the code.

### Usage presets and protection level

`presets.ts` `USAGES` lists `other`, `rental`, `job`, `sale`, `hotel`, `bank`, `government`, each with `cover: ZoneKey[]` (every preset covers `can`). Keys a document does not have are ignored. `protectionSummary()` only counts recommendations available on the documents in use: coverage weighs 80%, watermark 20%; `high` ≥ 0.95, `medium` ≥ 0.6. Manual mode caps at `medium`. `protectionMessage(summary, t)` builds the sentence from the dictionary.

### i18n API

- `m()` returns the current `Messages` and `getLang()` the current `Lang`; both are reactive (reading them in templates or `$derived` tracks language changes).
- `setLang(lang)` switches, persists to `localStorage` and calls `syncDocument()` (updates `<html lang>`, title and meta description).
- `detectLang(saved, preferred)`: valid saved choice, else `browserLang(preferred)` (first browser language whose primary subtag is supported, else `en`). `public/theme-init.js` duplicates this logic and its `supported` list.
- `setLang(choice)` accepts a language or `'auto'`. `preferenceFor()` decides what to store: nothing for `'auto'` or for the browser's own language (so the app keeps following the browser), the language otherwise. While nothing is stored, a `languagechange` event updates the UI. The header menu offers "Automatic" first.
- Dynamic text is a function in the dictionary (`status.loadedOne(face)`, `country.results(count)`…). **Status messages are stored as functions of the dictionary** (`StatusMessage = (t: Messages) => string`), e.g. `app.status = (t) => t.status.zoneAdded`, so they re-render when the language changes. Do not store a pre-rendered string.
- Pure helpers in `text.ts` take `t` as an argument; use them instead of formatting labels or file names by hand.
- Inline markup rendered by `Rich.svelte`: `[Key]` → `<kbd>`, `**text**` → `<strong>`, `` `text` `` → `<code>`. Never use `{@html}`.
- `t.files.*` words must be lowercase ASCII (tested).

## Recipes

### Add a country or document model

1. **Geometry** in `src/lib/documents.ts`: add the id to `DocumentId`, define a `DocumentType` with measured rects (fractions of the card, from an official specimen), `short`, `issuedFrom`/`issuedUntil`, `aliases`, ID-1 size, and add it to `DOCUMENTS`. Reuse existing `ZoneKey`s; only add a key if the data is genuinely new (see below). The unit tests require: unique keys, rects inside the card, zones on both sides, ID-1 size, and `number`, `name`, `birthDate`, `photo` present (signature, CAN and MRZ are not on every document). `short` may contain spaces ("Passport Card"); file names go through `fileSlug()`.
2. **Dictionaries** (`en.ts`, `es.ts`, `fr.ts`, `it.ts`): `documents[id]` with `countryName`, `name`, `sides` (label + hint) and a `zones` entry for exactly the keys the document has (tested). Add `the` (the document inside a sentence, used by `settings.autoHelp`) and update the copy that lists supported documents: `meta.description`, `hero.lead`, the FAQ item "Which documents are supported?", `info.usage.note` if relevant, plus the static `<meta name="description">` in `index.html` and README "Features".
3. **Flag** in `src/components/Flag.svelte`: add a simplified SVG (viewBox `0 0 3 2`) to the `{#if}` branch, or rely on the ISO-code badge fallback.
4. **Sample** in `src/lib/sample.ts`: draw a fictitious card with data where the real one has it, no official emblems, and add it to `sampleCards()`. Without it, `sampleCards()` falls back to the DNI drawing, which will not match the new zones.
5. **Tests:** `presets.test.ts` checks every document automatically; update the exact-list assertions in `document-search.test.ts` (catalog order, ids per query, `isCurrent` for every document) and `presets.test.ts` (`protectionSummary` totals), and add e2e coverage in the `countries` describe of `e2e/app.spec.ts` (fields, sample, protection level, file names).
6. **Help line:** a new country also needs at least one official help service (see below).
7. CHANGELOG entry under `[Unreleased]`.

### Add an identity-theft help line

Only add services checked on their official website. Add an entry to `HELP_LINES` in `src/lib/help-lines.ts` (service name and operator as proper nouns, contacts with `kind`/`value`/`href`, `free` only when the service says so, national `emergency` numbers, `source` URL) and extend `HelpLineId`; then add `info.help.lines[id]` (what the service does) in every dictionary. The Info table sorts the countries of the documents in use first. Every country with a supported document must have at least one line (tested in `tests/unit/help-lines.test.ts`).

### Add a UI language

1. Create `src/lib/i18n/<code>.ts` exporting `const <code>: Messages = { … }` with the exact shape of `en.ts`.
2. In `src/lib/i18n/lang.ts`: extend `Lang`, add `{ code, name }` (native name) to `LANGUAGES` and the dictionary to `DICTIONARIES`.
3. Add the code to the `supported` array in `public/theme-init.js`.
4. Tests: update the `LANGUAGES` expectation in `tests/unit/i18n.test.ts`, add helper/download-name cases, and extend the e2e `languages` tests (the trigger regexes such as `/^(Language|Idioma|Langue|Lingua)/` must include the new label). Search and picker pick up the new language automatically via `LANGUAGES`.
5. README "Languages" feature line and CHANGELOG.

### Add a UI string

Add the key to `en.ts` (with a doc comment if it is used as an accessible name or in a sentence), then the same key in `es.ts`, `fr.ts` and `it.ts` (TypeScript and the shape test fail otherwise). Use parameters through functions, never string concatenation in components. Read it with `m().section.key` (or `t` from `$derived(m())`), and use `<Rich text=… />` if it has markup.

### Add a usage preset

Add the id to `UsageId` and an entry to `USAGES` in `presets.ts` (cover must include `can`), then `usages[id]` (`label`, `short`, `watermark`, `note`) in all four dictionaries. Settings and the Info table iterate `USAGES` automatically. Update `presets.test.ts`.

### Add a zone key

Add it to `ZoneKey` and `ZONE_KEYS` (position = display order in mixed checklists), add a neutral name to `fields` in all dictionaries (`satisfies Record<ZoneKey, string>`), add per-document `zones` text where it exists, and decide which presets cover it. Check `protectionSummary` totals in tests.

## Development environment

Node.js version: `.nvmrc` (`26`); `package.json` `engines` allows `>=20.19`.

```bash
npm install              # or npm ci
npm run dev              # Vite dev server, http://localhost:5173 (host: true)
npm run check            # svelte-check + TypeScript, --fail-on-warnings
npm test                 # Vitest unit tests (tests/unit/**/*.test.ts, node environment)
npm run test:watch       # Vitest in watch mode
npm run build            # production build into dist/ (with source maps)
npm run preview          # serve dist/ on http://localhost:4173 (strict port)
npx playwright install chromium   # once, for e2e
npm run test:e2e         # Playwright, builds and previews automatically
```

`VITE_SOURCE_URL` and `VITE_APP_VERSION` can be set in the environment for dev/build (`VERSION` shows `dev` otherwise).

### Without a local Node.js

Use the same images as the build and CI:

```bash
# Install, check, unit tests and build (Alpine/musl, like the Dockerfile)
docker run --rm -it -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app node:26-alpine \
  sh -c 'npm ci && npm run check && npm test && npm run build'

# Dev server
docker run --rm -it -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app -p 5173:5173 node:26-alpine \
  sh -c 'npm ci && npm run dev'

# End-to-end tests (glibc image with browsers; tag must match @playwright/test, 1.65.1 in package-lock.json)
docker run --rm -it --ipc=host -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app \
  mcr.microsoft.com/playwright:v1.65.1-noble sh -c 'npm ci && npm run test:e2e'
```

**Pitfall:** Vite 8 bundles with rolldown, which ships a platform-specific native binding (`@rolldown/binding-linux-x64-musl` vs `-gnu`). A `node_modules` installed on Alpine (musl) does not work in the glibc Playwright image or on a glibc host, and vice versa. Run `npm ci` again whenever you switch environments.

### Playwright

- Projects: `desktop` (Desktop Chrome) and `mobile` (Pixel 7). Some tests skip on one of them (`isMobile`).
- The top-level `beforeEach` picks the Spanish DNI with `useDocument()` (language-independent, by `data-id`), because the app starts with the custom document. Tests tagged `@default` skip it to check the initial state. The choice is not stored, so call `useDocument()` again after `page.reload()` when a test needs it.
- No locale is configured, so Playwright's default `en-US` applies and the app starts in English; the `French browser` and `Italian browser` describes use `test.use({ locale: ... })`.
- Without `E2E_BASE_URL` it runs `npm run build && npm run preview` on port 4173. With `E2E_BASE_URL=http://localhost:8080` it tests an already running container instead:

  ```bash
  docker build -t sequrid:local .
  docker run -d --name sequrid -p 8080:8080 --read-only --tmpfs /tmp sequrid:local
  E2E_BASE_URL=http://localhost:8080 npx playwright test --project=desktop
  ```

  (From inside the Playwright container, add `--network host` so `localhost:8080` reaches it.)
- `SCREENSHOTS=1 npm run test:e2e` saves screenshots (layout, language menu, picker in light and dark) to `test-results/screens/`.
- In CI: `forbidOnly`, 1 retry, GitHub + HTML reporters; the report is uploaded on failure.

## Testing expectations

| Suite | Covers |
| --- | --- |
| `tests/unit/presets.test.ts` | every document's zone catalog (valid rects, both sides, ID-1, risky fields present), DNI/CNI specifics, presets, `protectionSummary`/`protectionMessage` in en/es/fr |
| `tests/unit/document-search.test.ts` | document metadata, Intl country names and fallbacks, `normalizeText`, search/grouping with the real catalog and a large fake catalog |
| `tests/unit/i18n.test.ts` | dictionary shape parity, no empty strings, field/zone/usage coverage, file-name words, French spacing and apostrophes, `detectLang`, text helpers and download names |
| `tests/unit/effects.test.ts` | pixelate, box blur, grayscale, cover strength |
| `tests/unit/geometry.test.ts` | rect creation, clamping, move/resize, pixels, rotation, fit |
| `tests/unit/pdf.test.ts` | page layout (real/large), PDF structure, untouched JPEG bytes, A4 and real size, no metadata |
| `tests/unit/watermark.test.ts` | date format, text composition and uppercasing, tiling layout |
| `e2e/app.spec.ts` | language detection, **no network requests**, sample, presets, protection level, PDF/JPG downloads and names, uploads, multi-file slots, keyboard zones and drawing, compare and framing, no horizontal scroll, mobile bar, country picker (search, keyboard, Escape, fit), language switching and persistence, French browser |

- Every user-facing change needs unit and/or e2e coverage. Pure logic goes in `src/lib` with Vitest tests; interaction goes in Playwright, with selectors by role and accessible name.
- The network test (no requests except same-origin GETs on load, and **none at all** while loading a sample and downloading a PDF) must keep passing. Never weaken it.
- Run `npm run check`, `npm test` and `npm run test:e2e` before declaring work done.

## Release and versioning

- [`VERSION`](VERSION) holds only the semver number and is the **single source of truth**: CI uses it for image tags, the chart `version`/`appVersion` and the git tag. Still bump `VERSION`, `charts/sequrid/Chart.yaml` (`version` and `appVersion`) and `package.json` `version` together (also `package-lock.json`, e.g. with `npm version <x.y.z> --no-git-tag-version`) and update the version in the README Helm example.
- **CHANGELOG.md** follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Add every user-facing change under `## [Unreleased]` (Added / Changed / Removed / Security…). When bumping, move those entries to `## [X.Y.Z] - YYYY-MM-DD` and update the compare links at the bottom. Never edit or reuse a released version; released versions are never overwritten.
- CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) on PRs, pushes to `main` and manual dispatch:
  1. **version**: validates `VERSION`; `release=true` only on a push to `main` when tag `v<VERSION>` does not exist. Warns on PRs if the version is already released.
  2. **test**: `npm ci`, `npm run check`, `npm test`, `npm run build` (Node from `.nvmrc`).
  3. **e2e**: Playwright on both projects.
  4. **helm**: `helm lint` (default and with every option enabled), `helm template`, `helm package` with `VERSION`.
  5. **image**: builds, smoke test (`/healthz`, SPA served, CSP with `connect-src 'none'`, `nosniff`, user `101`), e2e against the container (desktop), then multi-arch build (amd64 + arm64) with SBOM and provenance. PRs only build. Tags: `latest` and short SHA on `main`; `X.Y.Z` and `X.Y` on release (`X` too from 1.0).
  6. **release** (only when `release=true`): pushes the chart to `oci://ghcr.io/javsanpae/charts`, creates tag `vX.Y.Z` and a GitHub release with the packaged chart.
- **Dependabot** (`.github/dependabot.yml`): weekly npm (grouped dev dependencies), GitHub Actions and Docker updates. TypeScript is held below 7 because `svelte-check` 4 does not support it yet; remove the ignore rule only when it does.

## Deployment notes

- **Image** (`Dockerfile`): multi-stage; builds on `node:26-alpine` (build args `APP_VERSION`, `SOURCE_URL`), serves from `nginxinc/nginx-unprivileged:1.31-alpine` as UID **101** on port **8080**, healthcheck on `/healthz`. Works with a read-only root filesystem and a `/tmp` tmpfs. nginx: `access_log off`, `server_tokens off`, gzip, security headers on every location, `/assets/` cached immutable, everything else `no-cache` with SPA fallback to `index.html`.
- `.dockerignore` is a whitelist: new top-level files needed by the build must be added there and copied in the `Dockerfile`.
- **docker-compose.yaml**: `read_only`, `/tmp` tmpfs (16m), `cap_drop: ALL`, `no-new-privileges`, `mem_limit: 64m`; `SEQURID_PORT` and `SEQURID_VERSION` variables; `docker compose up -d --build` builds from source.
- **Helm chart** (`charts/sequrid`, `values.yaml`): `ingress.*` or `httpRoute.*` (Gateway API) to expose it; `networkPolicy.enabled` allows ingress on the HTTP port (optionally restricted by `networkPolicy.ingressFrom`) and **denies all egress**; `autoscaling.*`, `podDisruptionBudget.*`. Defaults: `runAsNonRoot`, UID/GID 101, `RuntimeDefault` seccomp, no privilege escalation, `readOnlyRootFilesystem`, all capabilities dropped, `serviceAccount.automount: false`, in-memory `emptyDir` for `/tmp`, probes on `/healthz`, service port 80 → container 8080. `helm test` runs a busybox `wget` against `/healthz`; its pod is labelled `app.kubernetes.io/component: test` without the selector labels (so the Service, PDB and NetworkPolicy ignore it), and must be allowed in `networkPolicy.ingressFrom` when that is set (example in `values.yaml`).

## Before you open a PR

- [ ] No network requests, external resources, runtime dependencies, inline scripts or new persisted state; CSP untouched (or tightened).
- [ ] No real personal data; samples stay fictitious and emblem-free.
- [ ] All new UI text is in `en.ts`, `es.ts`, `fr.ts` and `it.ts` with matching shape and correct typography.
- [ ] Keyboard, focus and ARIA work; no horizontal overflow on mobile; light and dark themes look right.
- [ ] `npm run check` reports 0 errors and 0 warnings; `npm test` and `npm run test:e2e` pass; new behavior has tests.
- [ ] `CHANGELOG.md` updated under `[Unreleased]` for user-facing changes.
- [ ] If releasing: `VERSION`, `Chart.yaml` (`version`, `appVersion`), `package.json`/`package-lock.json` bumped together and the changelog section moved.
- [ ] README/AGENTS.md updated if commands, structure or behavior changed.
- [ ] Code, comments, commit messages and PR description in English.
