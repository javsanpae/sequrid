# Sequrid

Protect your ID card before sending it: cover the data nobody needs, add a watermark with the recipient and the date, and download a PDF or JPG ready to send.

**Everything runs in your browser.** The server only delivers static files (HTML, JS and CSS); there is no backend, no database and no file upload. It is open source precisely so that anyone can check this and host it themselves.

## Features

- **Several countries**: Spanish DNI (2021 model), French carte nationale d'identité (2021 onwards) Italian carta d'identità elettronica (CIE 3.0, current design since 2022), UK photocard driving licence (Great Britain and Northern Ireland) and US passport card. The UK and the US have no national identity card, so these are the cards people use as ID. Each ID has its own country picker, with a search box and documents grouped by country (with room for several models per country), and the zones are placed over the data of that model.
- **Up to two IDs** (front and back of each), which can be from different countries. Drop several photos at once and they fill the free slots; you can also paste them with <kbd>Ctrl</kbd>+<kbd>V</kbd> or take the photo with your phone.
- **What the copy is for**: rental, job, sale, hotel, bank, public administration or other. Each use suggests which fields to cover and the watermark text.
- **What to cover**, in automatic or manual mode (you draw the zones). In automatic mode, the zones depend on the document:
  - DNI: number, support number, date of birth, signature, CAN, expiry date, name, photo, address, place of birth, parents and MRZ.
  - Carte d'identité: number (including the ones printed vertically), serial number, date and place of birth, signature, CAN, expiry date, issue date, names, photo and ghost portraits, height, address, 2D-Doc seal and MRZ.
- **How it is covered**: black, pixelated or blurred (the last two use large blocks so the text cannot be reconstructed).
- **Editor**: move and resize zones, draw your own, frame the card, rotate 90°, zoom and before/after view. With the keyboard: <kbd>Tab</kbd> cycles through the zones, arrow keys move them, <kbd>Shift</kbd>+arrows resize them and <kbd>Delete</kbd> removes them.
- **Watermark** tiled diagonally: automatic text (use · recipient · date) or your own, with adjustable intensity, size and light or dark tone. Optional black-and-white copy.
- **Protection level** based on the recommendations for the chosen use.
- **Download** as an A4 PDF at real size (85.6 × 54 mm, like a photocopy) or enlarged, a JPG of one side or a JPG with all of them. Downloads carry no metadata (no GPS, no phone model).
- **Languages**: the interface is available in English, Spanish, French and Italian. It follows your browser language automatically (English if it is not one of these); you can pick another one in the header, and choose "Automatic" to go back to following the browser.
- **Help if your identity is misused**: a table of official services by country (Spain, France, Italy, the United Kingdom and the United States) with how to reach them and the emergency numbers.
- Mobile-friendly layout, light and dark themes, and sample cards with fictitious data to try it out.

## Verifiable privacy

- Photos are read with `createImageBitmap`, drawn on a `<canvas>` and exported with `canvas.toBlob`; the PDF is produced by a small writer of our own ([`src/lib/pdf.ts`](src/lib/pdf.ts)). There are no runtime dependencies.
- nginx sends a `Content-Security-Policy` with **`connect-src 'none'`** and `form-action 'none'`: the browser blocks any `fetch`, XHR, WebSocket or form submission from the page. Even if the code tried, it could not send anything.
- Nothing is stored: neither the photos nor the settings. Reloading starts from scratch. The only things remembered (in `localStorage`, on your device) are your theme (light or dark) and your interface language.
- nginx has the access log turned off.
- Try it: load the page, switch on airplane mode and use it. It works the same.
- The e2e tests check that loading a photo, processing it and downloading the PDF makes **no** network requests at all.

## Installation

The image is published as `ghcr.io/javsanpae/sequrid` for `linux/amd64` and `linux/arm64`. It listens on port **8080**, runs as an unprivileged user (UID 101) and works with a read-only file system.

### Docker Compose

```bash
docker compose up -d
```

Open <http://localhost:8080>. Optional variables: `SEQURID_PORT` (host port, 8080 by default) and `SEQURID_VERSION` (image tag, `latest` by default). To build from source: `docker compose up -d --build`.

### Docker

```bash
docker run -d --name sequrid -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL ghcr.io/javsanpae/sequrid:latest
```

### Kubernetes (Helm)

The chart lives in [`charts/sequrid`](charts/sequrid) and is also published as an OCI artifact with every release:

```bash
helm install sequrid oci://ghcr.io/javsanpae/charts/sequrid --version 0.5.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=sequrid.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix
```

Or from the repository: `helm install sequrid ./charts/sequrid`.

Notable options in [`values.yaml`](charts/sequrid/values.yaml):

| Value | Purpose |
| --- | --- |
| `ingress.*` | Expose it with an Ingress (class, annotations, TLS). |
| `httpRoute.*` | Gateway API alternative. |
| `networkPolicy.enabled` | Allows incoming traffic on the HTTP port (optionally only from `networkPolicy.ingressFrom`) and **blocks all outgoing traffic** from the pod. |
| `autoscaling.*`, `podDisruptionBudget.*` | Scaling and availability. |
| `resources`, `nodeSelector`, `tolerations`, `affinity` | The usual. |

By default the pod runs as non-root, with no capabilities, a `readOnlyRootFilesystem`, no Kubernetes API token and an in-memory `emptyDir` for `/tmp`.

Nothing special is needed behind a reverse proxy: it is a static site. Use HTTPS so the browser allows the phone camera and every API.

## Development

Requirements: Node.js 26 (the version is in [`.nvmrc`](.nvmrc); 20.19 or later works).

```bash
npm install
npm run dev          # development server at http://localhost:5173
npm run check        # svelte-check + TypeScript
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright, desktop and mobile)
npm run build        # builds dist/
```

The e2e tests need Playwright's browser (`npx playwright install chromium`). With `E2E_BASE_URL=http://localhost:8080` they run against an already running container instead of `vite preview`, and with `SCREENSHOTS=1` they save screenshots to `test-results/screens/`.

No Node.js on your machine? Everything also runs in Docker with the `node:26-alpine` and Playwright images; see [Without a local Node.js](AGENTS.md#without-a-local-nodejs) in `AGENTS.md`.

### Structure

```
src/
  lib/
    config.ts          source code URL and version shown in the interface
    documents.ts       documents per country and their zones (coordinates relative to the card)
    countries.ts       country names from the browser (Intl.DisplayNames)
    document-search.ts picker grouping by country and accent-insensitive search
    i18n/              interface texts (en, es, fr, it) and language selection
    help-lines.ts      official identity-theft help services by country
    presets.ts         uses, what each one covers and protection level
    state.svelte.ts    application state (Svelte 5 runes)
    files.ts           loading photos into the slots and the sample cards
    image.ts           image decoding (EXIF orientation), downscaling and canvas helpers
    geometry.ts        rectangle math: move, resize, rotate, pixels
    sample.ts          fictitious sample cards drawn on a canvas
    watermark.ts       watermark text and geometry
    effects.ts         pixelate, blur and grayscale on RGBA buffers
    render.ts          final canvas composition (crop, zones, grayscale, watermark)
    pdf.ts             A4 PDF writer with JPEG images
    export.ts          PDF/JPG downloads
  components/          user interface (Svelte 5)
tests/unit/        tests of the pure logic
e2e/               browser tests, including the network check
nginx/             server configuration and security headers
charts/sequrid/    Helm chart
```

### Adding a country or document

Only add documents whose layout you have checked against an official specimen.

1. In [`src/lib/documents.ts`](src/lib/documents.ts), add the new id to the `DocumentId` union, define a `DocumentType` with its zones and metadata (`country`, `short`, `issuedFrom`, `issuedUntil` for models no longer issued, search `aliases`) and add it to `DOCUMENTS`. Each rectangle says which side it is on and is expressed as fractions of the card's width and height. Use the `ZoneKey` keys so the uses (rental, hotel…) work without touching anything else. `documents.ts` only holds geometry and identifiers.
2. Add the display texts to `documents[id]` in every dictionary in [`src/lib/i18n/`](src/lib/i18n/) (`en`, `es`, `fr`): country, model name, sides and the label and hint of each of its zones. In the three languages, also update `settings.autoHelp` (it branches on the document ids) and the copy that lists the supported documents: `meta.description`, `hero.lead` and the FAQ item "Which documents are supported?", plus the static `<meta name="description">` in [`index.html`](index.html) and the features list in this README.
3. Optional: draw its flag in [`Flag.svelte`](src/components/Flag.svelte). Countries without one get a badge with their ISO code.
4. Draw a fictitious sample in [`src/lib/sample.ts`](src/lib/sample.ts), with made-up data where the real document has it and no official emblems, and return it from `sampleCards()`. Otherwise `sampleCards()` falls back to the DNI drawing, which does not match the new zones.
5. Tests: the unit tests go through every document and check that the zones are valid; update the assertions that list the exact catalog in [`tests/unit/document-search.test.ts`](tests/unit/document-search.test.ts) (order, search results, current models) and [`tests/unit/presets.test.ts`](tests/unit/presets.test.ts) (protection totals), and add e2e coverage.

[`AGENTS.md`](AGENTS.md) has the full checklist.

## Contributing

- The repository language is **English**: code, comments, documentation, commit messages and pull requests.
- Add every user-facing change to [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]`.
- To release, bump [`VERSION`](VERSION) (see [Releasing a version](#releasing-a-version)).
- [`AGENTS.md`](AGENTS.md) has project context for coding agents.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **version**: reads and validates the [`VERSION`](VERSION) file and decides whether to release.
2. **test**: `svelte-check`, unit tests and build.
3. **e2e**: Playwright on desktop and mobile.
4. **helm**: `helm lint` (default and with every option enabled), `helm template` and `helm package` with the version in `VERSION`.
5. **image**: builds the image, runs a smoke test (health, CSP, non-root user), reruns the e2e tests against the container and publishes it to `ghcr.io` for amd64 and arm64, with SBOM and provenance. Pull requests only build it. On `main` it is always published as `latest` and with the SHA; when there is a new version, also as `X.Y.Z` and `X.Y`.
6. **release**: when there is a new version, publishes the chart to `oci://ghcr.io/javsanpae/charts/sequrid`, creates the `vX.Y.Z` tag and a GitHub release with the chart attached.

### Releasing a version

The version lives in the [`VERSION`](VERSION) file, which only contains the number (for example `0.5.0`). It is the single source of truth: the image, the chart (`version` and `appVersion`) and the git tag take it from there. The versions in `Chart.yaml` and `package.json` are not used for publishing.

1. On your branch, bump `VERSION` following [semver](https://semver.org/) and move the `[Unreleased]` entries in [`CHANGELOG.md`](CHANGELOG.md) to a section for the new version.
2. Merge the pull request into `main`.
3. CI sees that the `v<VERSION>` tag does not exist and publishes the image, the chart and the release.

If you merge without changing `VERSION`, no new version is released (only the `latest` and SHA image tags); CI warns about it on the pull request. A released version is never overwritten.

The first time, the ghcr.io package is created as private: make it public in the package settings on GitHub so anyone can pull it.

See [`CHANGELOG.md`](CHANGELOG.md) for the changes in each version.

## License

[GNU Affero General Public License v3.0 or later](LICENSE) (AGPL-3.0-or-later).

You can use, deploy, modify and sell Sequrid, including as a paid hosted service, as long as the result stays open source under the same license. Unlike the GPL, the AGPL also covers use over a network: if you offer a modified version to other people from a server, you must give them access to its source code.

To comply in a fork, point the "Source code" link in the interface to your repository with the `SOURCE_URL` build argument (or `VITE_SOURCE_URL` in development):

```bash
docker build --build-arg SOURCE_URL=https://github.com/your-user/your-fork -t my-sequrid .
```

## Disclaimer

Zone positions are approximate: always check the preview before sending the copy. This tool is not affiliated with any official body. If your identity has been stolen, see the help table in the app for the official services in each supported country.
