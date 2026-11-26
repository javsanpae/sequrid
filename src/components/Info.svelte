<script lang="ts">
  import { DNI_ES, KEY_LABELS } from '../lib/documents';
  import { USAGES } from '../lib/presets';
  import { SOURCE_URL } from '../lib/config';
  import Icon from './Icon.svelte';

  const keyZones = DNI_ES.zones.filter((z) => ['soporte', 'nacimiento', 'firma', 'can', 'mrz', 'numero'].includes(z.key));

  const faqs = [
    {
      q: '¿La foto de mi DNI se sube a algún servidor?',
      a: 'No. La imagen se abre y se procesa dentro de tu navegador. El servidor solo entrega los archivos de la página, y su política de seguridad (CSP) prohíbe al navegador conectarse a ningún sitio: aunque quisiera, la página no podría enviar tu foto.',
    },
    {
      q: '¿Se guarda algo?',
      a: 'Nada de tus fotos ni de tus ajustes. Al recargar la página todo empieza de cero. Lo único que se recuerda es si prefieres el tema claro u oscuro.',
    },
    {
      q: '¿Pixelar o desenfocar es tan seguro como tapar en negro?',
      a: 'El negro es lo más seguro porque elimina por completo la información. El pixelado y el desenfoque de Sequrid usan bloques grandes para que el texto no se pueda reconstruir, pero si dudas, usa negro.',
    },
    {
      q: '¿Para qué sirve la marca de agua con fecha y destinatario?',
      a: 'Deja claro para quién y cuándo se hizo la copia. Si alguien la reutiliza para otra cosa, la marca lo delata y la copia pierde valor para un estafador.',
    },
    {
      q: '¿Qué es el CAN del DNI?',
      a: 'Son seis cifras en la esquina inferior derecha del anverso que permiten leer el chip por NFC. Nadie que reciba una copia lo necesita.',
    },
    {
      q: '¿Es legal enviar una copia del DNI con datos tapados?',
      a: 'Sí. Es tu documento y puedes decidir qué datos compartir. Si quien lo pide necesita algún dato concreto, destápalo solo para esa copia y deja la marca de agua.',
    },
    {
      q: '¿Puedo juntar dos documentos en el mismo PDF?',
      a: 'Sí. Activa «Añadir un segundo documento» y tendrás cuatro huecos; cada documento puede ser de un país distinto. El PDF coloca cada uno en una fila con sus dos caras.',
    },
    {
      q: '¿Qué documentos admite?',
      a: "El DNI español (modelo 2021) y la carte nationale d'identité francesa (desde 2021). Elige el país de cada documento en el panel de fotos y las zonas se colocan sobre sus datos. Iremos añadiendo más países.",
    },
    {
      q: '¿Funciona en el móvil y sin conexión?',
      a: 'Sí. En el móvil puedes hacer la foto directamente. Y una vez cargada la página, puedes activar el modo avión: todo sigue funcionando porque no necesita la red.',
    },
    {
      q: '¿Puedo instalarlo en mi propio servidor?',
      a: 'Sí, ese es el objetivo: es código abierto y se distribuye como imagen Docker y chart de Helm. Así puedes revisar exactamente qué hace y servirlo tú mismo.',
    },
  ];
</script>

<section id="que-tapar" class="block">
  <p class="eyebrow">Anverso y reverso</p>
  <h2>Qué datos del DNI conviene tapar</h2>
  <p class="lead">No todos los datos valen lo mismo para quien quiere hacerse pasar por ti. Estos son los que más se aprovechan y los que menos falta hacen en una copia.</p>
  <div class="grid cards">
    {#each keyZones as z (z.key)}
      <article class="mini">
        <h3>{z.label}</h3>
        <p>{z.hint}</p>
      </article>
    {/each}
  </div>
</section>

<section class="block">
  <p class="eyebrow">Según el trámite</p>
  <h2>Qué dejar visible según para qué es la copia</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th scope="col">Uso</th><th scope="col">Se tapa</th><th scope="col">Marca de agua</th></tr>
      </thead>
      <tbody>
        {#each USAGES.filter((u) => u.id !== 'otro') as u (u.id)}
          <tr>
            <th scope="row">{u.label}</th>
            <td>{u.cover.map((k) => KEY_LABELS[k]).join(', ')}</td>
            <td><code>{u.watermark.toLocaleUpperCase('es-ES')}</code></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="small">Cada documento solo tapa los datos que tiene: el código 2D-Doc y la estatura, por ejemplo, solo existen en la carta francesa. Es una orientación. Si quien te pide la copia necesita algún dato más, destápalo solo para él y deja la marca de agua.</p>
</section>

<section id="privacidad" class="block privacy">
  <div>
    <p class="eyebrow">Sin servidores de por medio</p>
    <h2>Tu DNI no sale de tu dispositivo. Compruébalo.</h2>
    <p class="lead">Sequrid funciona entero en tu navegador. La foto se lee del archivo, se dibuja en un lienzo, se tapa y se convierte a PDF o JPG ahí mismo.</p>
  </div>
  <ol class="steps">
    <li><span><Icon name="file" size={18} /></span>Abre esta página y espera a que cargue.</li>
    <li><span><Icon name="wifiOff" size={18} /></span>Activa el modo avión o desconecta la red.</li>
    <li><span><Icon name="shieldCheck" size={18} /></span>Protege tu DNI y descarga el PDF. Funciona igual.</li>
  </ol>
  <p class="small">
    Además, el servidor envía la cabecera <code>Content-Security-Policy: connect-src 'none'</code>, que impide al navegador hacer cualquier petición desde la página. El código es abierto: <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">revísalo tú mismo</a>.
  </p>
</section>

<section id="preguntas" class="block">
  <p class="eyebrow">Dudas habituales</p>
  <h2>Preguntas frecuentes</h2>
  <div class="faq">
    {#each faqs as f, i (i)}
      <details>
        <summary>{f.q}<Icon name="chevron" size={18} /></summary>
        <p>{f.a}</p>
      </details>
    {/each}
  </div>
  <p class="small">¿Te han suplantado? En España puedes llamar gratis al <strong>017</strong>, la línea de ayuda en ciberseguridad de INCIBE.</p>
</section>

<style>
  .block {
    max-width: 1100px;
    margin: 0 auto;
    padding: 56px 16px 0;
    display: grid;
    gap: 14px;
  }
  .eyebrow {
    font: 700 11px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  h2 {
    font-size: clamp(22px, 3vw, 30px);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .lead {
    color: var(--text-2);
    max-width: 70ch;
  }
  .small {
    font-size: 13px;
    color: var(--muted);
  }
  .grid.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 6px;
  }
  .mini {
    padding: 16px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .mini h3 {
    font-size: 15px;
    margin-bottom: 4px;
  }
  .mini p {
    font-size: 13.5px;
    color: var(--text-2);
  }
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    min-width: 620px;
  }
  th,
  td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  thead th {
    font: 700 11px var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface-2);
  }
  tbody tr:last-child > * {
    border-bottom: 0;
  }
  code {
    font: 600 11.5px var(--mono);
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--surface-2);
    white-space: nowrap;
  }
  .privacy {
    margin-top: 56px;
    padding: 32px clamp(16px, 4vw, 40px);
    border-radius: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    max-width: 1068px;
  }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .steps li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px;
    border-radius: 14px;
    background: var(--surface-2);
    font-weight: 600;
    font-size: 14px;
  }
  .steps span {
    flex: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--accent-soft);
    color: var(--accent-text);
  }
  .faq {
    display: grid;
    gap: 8px;
  }
  details {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }
  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    font-weight: 600;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary :global(svg) {
    flex: none;
    transition: transform 0.2s;
    color: var(--muted);
  }
  details[open] summary :global(svg) {
    transform: rotate(180deg);
  }
  details p {
    padding: 0 16px 16px;
    color: var(--text-2);
    font-size: 14px;
  }
</style>
