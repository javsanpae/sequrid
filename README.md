# Sequrid

Protege tu DNI antes de enviarlo: tapa los datos que nadie necesita, añade una marca de agua con el destinatario y la fecha, y descarga un PDF o un JPG listo para mandar.

**Todo se procesa en tu navegador.** El servidor solo entrega archivos estáticos (HTML, JS y CSS); no hay backend, ni base de datos, ni subida de archivos. Es código abierto precisamente para que cualquiera pueda comprobarlo y servirlo por su cuenta.

## Funcionalidades

- **Hasta dos DNI** (anverso y reverso de cada uno). Arrastra varias fotos a la vez y se colocan solas en los huecos libres; también puedes pegarlas con <kbd>Ctrl</kbd>+<kbd>V</kbd> o hacer la foto desde el móvil.
- **Para qué es la copia**: alquiler, trabajo, compraventa, hotel, banco, Administración u otro. Cada uso propone qué datos tapar y el texto de la marca de agua.
- **Qué tapar**, en modo automático (zonas colocadas sobre los datos del DNI 2021: número, soporte, fecha de nacimiento, firma, CAN, validez, nombre, foto, domicilio, lugar de nacimiento, padres y MRZ) o manual (dibujas tú las zonas).
- **Cómo se tapa**: negro, pixelado o desenfoque (estos dos usan bloques grandes para que el texto no se pueda reconstruir).
- **Editor**: mover y redimensionar zonas, dibujar zonas propias, encuadrar la tarjeta, girar 90°, zoom y vista antes/después. Con teclado: <kbd>Tab</kbd> recorre las zonas, flechas para moverlas, <kbd>Mayús</kbd>+flechas para agrandarlas y <kbd>Supr</kbd> para quitarlas.
- **Marca de agua** en mosaico diagonal: texto automático (uso · destinatario · fecha) o propio, intensidad, tamaño y tono claro u oscuro. Opción de copia en blanco y negro.
- **Nivel de protección** según lo recomendado para el uso elegido.
- **Descarga** en PDF A4 a tamaño real (85,6 × 54 mm, como una fotocopia) o ampliado, JPG de una cara o JPG con todas. Las descargas no llevan metadatos (ni GPS, ni modelo de móvil).
- Diseño adaptado a móvil, tema claro y oscuro, y un DNI de ejemplo con datos ficticios para probar.

## Privacidad verificable

- Las fotos se leen con `createImageBitmap`, se dibujan en un `<canvas>` y se exportan con `canvas.toBlob`; el PDF lo genera un escritor propio de unas 150 líneas ([`src/lib/pdf.ts`](src/lib/pdf.ts)). No hay dependencias en tiempo de ejecución.
- nginx envía una `Content-Security-Policy` con **`connect-src 'none'`** y `form-action 'none'`: el navegador bloquea cualquier `fetch`, XHR, WebSocket o envío de formularios desde la página. Aunque el código lo intentara, no podría mandar nada.
- No se guarda nada: ni las fotos ni los ajustes. Al recargar, todo empieza de cero. Lo único que se recuerda (en `localStorage`) es si prefieres el tema claro u oscuro.
- nginx tiene el log de accesos desactivado.
- Haz la prueba: carga la página, activa el modo avión y úsala. Funciona igual.
- Los tests e2e comprueban que, al cargar una foto, procesarla y descargar el PDF, la página no hace **ninguna** petición de red.

## Instalación

La imagen se publica en `ghcr.io/javsanpae/sequrid` para `linux/amd64` y `linux/arm64`. Escucha en el puerto **8080**, se ejecuta como usuario sin privilegios (UID 101) y funciona con el sistema de archivos en solo lectura.

### Docker Compose

```bash
docker compose up -d
```

Abre <http://localhost:8080>. Variables opcionales: `SEQURID_PORT` (puerto del host, 8080 por defecto) y `SEQURID_VERSION` (etiqueta de la imagen, `latest` por defecto). Para construir desde el código: `docker compose up -d --build`.

### Docker

```bash
docker run -d --name sequrid -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL ghcr.io/javsanpae/sequrid:latest
```

### Kubernetes (Helm)

El chart está en [`charts/sequrid`](charts/sequrid) y también se publica como OCI en cada versión:

```bash
helm install sequrid oci://ghcr.io/javsanpae/charts/sequrid --version 0.1.1 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=dni.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix
```

O desde el repositorio: `helm install sequrid ./charts/sequrid`.

Opciones destacadas de [`values.yaml`](charts/sequrid/values.yaml):

| Valor | Para qué |
| --- | --- |
| `ingress.*` | Exponer con un Ingress (clase, anotaciones, TLS). |
| `httpRoute.*` | Alternativa con Gateway API. |
| `networkPolicy.enabled` | Permite tráfico entrante al puerto HTTP y **bloquea todo el tráfico saliente** del pod. |
| `autoscaling.*`, `podDisruptionBudget.*` | Escalado y disponibilidad. |
| `resources`, `nodeSelector`, `tolerations`, `affinity` | Lo habitual. |

Por defecto el pod corre sin root, sin capacidades, con `readOnlyRootFilesystem`, sin token de la API de Kubernetes y con un `emptyDir` en memoria para `/tmp`.

Detrás de un proxy inverso no hace falta nada especial: es un sitio estático. Usa HTTPS para que el navegador permita la cámara del móvil y todas las APIs.

## Desarrollo

Requisitos: Node.js 26 (la versión está en [`.nvmrc`](.nvmrc); funciona desde la 20.19).

```bash
npm install
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run check        # svelte-check + TypeScript
npm test             # tests unitarios (Vitest)
npm run test:e2e     # tests end-to-end (Playwright, escritorio y móvil)
npm run build        # genera dist/
```

Para los e2e hace falta el navegador de Playwright (`npx playwright install chromium`). Con `E2E_BASE_URL=http://localhost:8080` se lanzan contra un contenedor ya arrancado en lugar de contra `vite preview`.

### Estructura

```
src/
  lib/
    documents.ts   catálogo de zonas del DNI (coordenadas relativas a la tarjeta)
    presets.ts     usos, qué se tapa en cada uno y nivel de protección
    watermark.ts   texto y geometría de la marca de agua
    effects.ts     pixelado, desenfoque y escala de grises sobre buffers RGBA
    render.ts      composición final en canvas (recorte, zonas, B/N, marca)
    pdf.ts         escritor de PDF A4 con imágenes JPEG
    export.ts      descargas PDF/JPG
    state.svelte.ts estado de la aplicación (Svelte 5 runes)
  components/      interfaz (Svelte 5)
tests/unit/        tests de la lógica pura
e2e/               tests de navegador, incluida la comprobación de red
nginx/             configuración del servidor y cabeceras de seguridad
charts/sequrid/    chart de Helm
```

Para añadir otro documento (NIE, pasaporte…) basta con definir otro `DocumentType` en `documents.ts` con sus zonas.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **version**: lee y valida el archivo [`VERSION`](VERSION) y decide si toca publicar versión.
2. **test**: `svelte-check`, tests unitarios y build.
3. **e2e**: Playwright en escritorio y móvil.
4. **helm**: `helm lint`, `helm template` con todas las opciones activadas y `helm package` con la versión de `VERSION`.
5. **image**: construye la imagen, hace un smoke test (salud, CSP, usuario sin root), repite los e2e contra el contenedor y la publica en `ghcr.io` para amd64 y arm64, con SBOM y procedencia. En las pull requests solo se construye. En `main` se publica siempre como `latest` y con el SHA; si hay versión nueva, también como `X.Y.Z` y `X.Y`.
6. **release**: si hay versión nueva, publica el chart en `oci://ghcr.io/javsanpae/charts/sequrid`, crea la etiqueta `vX.Y.Z` y una release de GitHub con el chart adjunto.

### Publicar una versión

La versión vive en el archivo [`VERSION`](VERSION), que solo contiene el número (por ejemplo `0.1.1`). Es la única fuente de verdad: la imagen, el chart (`version` y `appVersion`) y la etiqueta de git la toman de ahí. Las versiones de `Chart.yaml` y `package.json` no se usan para publicar.

1. En tu rama, sube el número de `VERSION` siguiendo [semver](https://semver.org/lang/es/).
2. Fusiona la pull request en `main`.
3. El CI ve que no existe la etiqueta `v<VERSION>` y publica la imagen, el chart y la release.

Si fusionas sin cambiar `VERSION`, no se publica ninguna versión nueva (solo `latest` y el SHA de la imagen); el CI avisa de ello en la pull request. Una versión ya publicada nunca se sobrescribe.

La primera vez, el paquete de ghcr.io se crea como privado: cámbialo a público en la configuración del paquete en GitHub para que cualquiera pueda descargarlo.

## Licencia

[GNU Affero General Public License v3.0 o posterior](LICENSE) (AGPL-3.0-or-later).

Puedes usar, desplegar, modificar y comercializar Sequrid, también como servicio de pago, siempre que el resultado siga siendo código abierto con la misma licencia. A diferencia de la GPL, la AGPL cubre también el uso a través de la red: si ofreces una versión modificada a otras personas desde un servidor, tienes que darles acceso a su código fuente.

Para cumplirlo en un fork, apunta el enlace «Código fuente» de la interfaz a tu repositorio con el argumento de build `SOURCE_URL` (o `VITE_SOURCE_URL` en desarrollo):

```bash
docker build --build-arg SOURCE_URL=https://github.com/tu-usuario/tu-fork -t mi-sequrid .
```

## Aviso

Las posiciones de las zonas son aproximadas: revisa siempre la vista previa antes de enviar la copia. Esta herramienta no está afiliada a ningún organismo oficial. Si te han suplantado la identidad, en España puedes llamar gratis al 017 (INCIBE).
