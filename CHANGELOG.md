# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The released version is the one in the [`VERSION`](VERSION) file.

## [Unreleased]

## [0.6.1] - 2026-11-26

### Changed

- The app starts with the custom document selected, so it works with any ID
  from the first moment. Pick your country in the photos panel to get the
  predefined zones of your document.

### Fixed

- A photo placed in the second document's slot could get the zones of the
  default document instead of those of the first document's country, because
  the second document inherited the country only after its zones were set.

## [0.6.0] - 2026-11-26

### Added

- "Custom" entry in the country picker for documents that are not in the
  list yet. It has no predefined fields: the app switches to "Draw" so you
  mark everything you want to cover, and the protection level is based on the
  zones you draw. It always comes last in the picker and is offered when a
  search finds nothing.
- Fictitious generic sample card to try the custom document.

### Fixed

- Missing comma in the Spanish, French and Italian answer to "Which documents
  are supported?".

## [0.5.0] - 2026-11-26

### Added

- United Kingdom: the photocard driving licence, which is the everyday ID in
  a country without a national identity card, in both current models: Great
  Britain (DVLA, design issued since December 2021) and Northern Ireland
  (DVA). Fields follow the numbering on the card (1–12), including the
  driver number, the address, the driving categories and dates, and the
  restriction codes on the back.
- United States: the passport card (Department of State, issued since 2008),
  the only nationwide federal ID in card format. It has no signature; its
  control numbers and barcode are grouped in one field.
- Fictitious sample cards for both UK licences and the US passport card, and
  their flags.
- Help lines for the United Kingdom (Report Fraud, formerly Action Fraud, for
  England, Wales and Northern Ireland, and Police Scotland on 101) and the
  United States (IdentityTheft.gov from the FTC).

### Changed

- Usage presets also cover driving restriction codes, which can reveal health
  conditions, and job and sale cover the driving categories and their dates.
- Download names turn multi-word document names into safe words, e.g.
  `passport-card-protected.pdf`.

## [0.4.0] - 2026-11-26

### Added

- Support for the Italian electronic identity card (CIE 3.0) in its current
  design, issued since September 2022, with its own fields: tax code (codice
  fiscale) and the barcode that encodes it, birth record details, issuing
  municipality, height and the small secondary portraits. Place and date of
  birth share one line on this card, so they are covered together.
- Fictitious Italian sample card to try the app.
- The interface is also available in Italian.
- "Automatic" option in the language menu: the app follows the browser
  language, and keeps following it if the browser language changes.
- The identity-theft help lines are now a table by country (Spain, France and
  Italy), with the official service, how to reach it, what it does and the
  emergency numbers. The countries of the documents in use come first, and
  the header links to it. It turns into cards on narrow screens.

### Changed

- Choosing the language your browser already uses no longer saves a
  preference, so the app keeps detecting your language. Only a different
  language is remembered.
- A language chosen with 0.3.0 is forgotten once, because that version saved
  every pick, including the browser's own language. Everyone starts again from
  the browser language. The preference is now stored under the
  `sequrid-language` key.
- Usage presets also cover the tax code and the birth record details when the
  document has them, and job and sale cover the issuing authority.

## [0.3.0] - 2026-11-26

### Added

- The user interface is available in English, Spanish and French, with a
  language selector in the header. The choice is remembered in the browser;
  on the first visit the app follows the browser language and falls back to
  English.
- Search box in the country and document picker. The picker now groups
  documents by country and has room for several (including older) models per
  country.
- `AGENTS.md` with project context for coding agents.
- This changelog.

### Changed

- English is now the official language of the repository (documentation, code
  comments and commit messages) and the default language of the interface.
- Downloaded file names follow the interface language, e.g. `dni-protected.pdf`
  in English and `dni-protegido.pdf` in Spanish.

### Fixed

- The Helm test pod no longer carries the app's selector labels, so the
  NetworkPolicy (which denies all egress) no longer blocks `helm test`. When
  `networkPolicy.ingressFrom` restricts traffic, allow the test pod as shown
  in `values.yaml`.

## [0.2.0] - 2026-11-26

### Added

- Country selector for each ID. The zones offered depend on the chosen
  document.
- Support for the French carte nationale d'identité (2021), with its own
  fields: 2D-Doc seal, height, issue date, the vertically printed repeated
  numbers and the ghost portraits.
- IDs from different countries can be mixed in the same copy; the checklist
  then uses neutral field names. Changing a country moves the automatic zones
  and keeps the ones you drew, and a second ID starts with the first one's
  country.
- Fictitious French sample card to try the app.
- Download names depend on the document (e.g. `cni-protegido.pdf` for the
  French card).

### Changed

- The protection level only counts recommendations that exist on the
  documents in use, and usage presets skip fields a document does not have.
- CI reads the Node.js version from `.nvmrc` (Node.js 26), and the container
  is built on `node:26-alpine`.
- The image is served by `nginxinc/nginx-unprivileged:1.31-alpine` (was
  1.29).
- Development dependencies updated: Vite 8, Vitest 5,
  `@sveltejs/vite-plugin-svelte` 7 and TypeScript 6.
- GitHub Actions updated: `actions/checkout` 7, `docker/build-push-action` 7,
  `docker/metadata-action` 6, `docker/login-action` 4 and `azure/setup-helm` 5.
- Dependabot no longer proposes TypeScript 7, which `svelte-check` 4 does not
  support yet.

### Security

- The nginx base image update to 1.31 brings in the upstream security fixes.

## [0.1.1] - 2026-11-26

### Added

- Releases are driven by the `VERSION` file. When a change that bumps it is
  merged into `main`, CI publishes the image (`X.Y.Z` and `X.Y`) and the Helm
  chart with that version, tags the commit and creates a GitHub release with
  the packaged chart. A version that is already released is never
  overwritten.
- Pull requests get a warning when `VERSION` matches an already released
  version, and the chart is packaged with `VERSION` on every run.

### Removed

- Publishing by pushing `vX.Y.Z` git tags by hand.

## [0.1.0] - 2026-11-26

### Added

- First release of Sequrid, a self-hosted web app to protect a photo of a
  Spanish DNI (2021 model) before sending it. Everything runs in the browser.
- Up to two IDs, front and back. Drop several photos at once and they fill the
  free slots; photos can also be pasted or taken with the phone camera. A
  sample DNI with fictitious data is included.
- Usage presets (rental, job, sale, hotel, bank, public administration, other)
  that suggest which fields to cover and the watermark text.
- Automatic covering of 12 DNI fields (number, support number, date of birth,
  signature, CAN, expiry, name, photo, address, place of birth, parents and
  MRZ) or manual covering with your own zones, in black, pixelated or blurred.
- Editor to move, resize and draw zones and frame the card, with 90° rotation,
  zoom, a before/after view and keyboard shortcuts.
- Tiled diagonal watermark with automatic (use · recipient · date) or custom
  text, adjustable intensity, size and light or dark tone. Optional grayscale
  copy.
- Protection level based on the recommendations for the chosen use.
- Downloads as an A4 PDF at real ID-1 size (85.6 × 54 mm) or enlarged, as a
  JPG of one side or as a JPG with all sides, all without metadata.
- Responsive layout with light and dark themes.
- Strict Content Security Policy with `connect-src 'none'`: the page cannot
  send anything over the network.
- Multi-arch (amd64, arm64) Docker image that runs as a non-root user on a
  read-only file system, a `docker-compose.yaml` and a Helm chart with
  optional Ingress, HTTPRoute, NetworkPolicy, HorizontalPodAutoscaler and
  PodDisruptionBudget.
- CI with type checking, unit, end-to-end, Helm and smoke tests, and
  publishing of the image and chart to `ghcr.io`.
- Licensed under the GNU Affero General Public License v3.0 or later.

[Unreleased]: https://github.com/javsanpae/sequrid/compare/v0.6.1...HEAD
[0.6.1]: https://github.com/javsanpae/sequrid/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/javsanpae/sequrid/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/javsanpae/sequrid/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/javsanpae/sequrid/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/javsanpae/sequrid/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/javsanpae/sequrid/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/javsanpae/sequrid/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/javsanpae/sequrid/releases/tag/v0.1.0
