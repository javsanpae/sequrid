import type { DocumentId } from './documents';
import { createCanvas, ctx2d } from './image';

/**
 * Draws fictitious ID cards used as examples. They follow the layout of each
 * real document so the default zones line up, but they contain made-up data
 * and none of the official artwork.
 */
const W = 1712;
const H = 1080;
const SANS = '"Helvetica Neue", Arial, "Liberation Sans", sans-serif';
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';

type Ctx = CanvasRenderingContext2D;

function roundedPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx: Ctx, t: string, fx: number, fy: number, size: number, opts: { color?: string; weight?: number; font?: string } = {}) {
  ctx.font = `${opts.weight ?? 600} ${Math.round(size * H)}px ${opts.font ?? SANS}`;
  ctx.fillStyle = opts.color ?? '#1c232b';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(t, fx * W, fy * H);
}

const label = (ctx: Ctx, t: string, fx: number, fy: number) => text(ctx, t, fx, fy, 0.026, { color: '#6b4f3a', weight: 500 });

function cardBase(ctx: Ctx, stops: string[]) {
  ctx.fillStyle = '#c9ced6';
  ctx.fillRect(0, 0, W, H);
  roundedPath(ctx, 0, 0, W, H, 0.05 * H);
  ctx.save();
  ctx.clip();
  const g = ctx.createLinearGradient(0, 0, W, H);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Guilloche-like background lines.
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 46; i++) {
    ctx.strokeStyle = `rgba(150, 110, 80, ${0.05 + (i % 3) * 0.02})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = (i / 46) * H * 1.2 - 0.1 * H + Math.sin(x / 70 + i * 0.6) * 18 + Math.sin(x / 230) * 30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function dniFront(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#f4e3c3', '#eef0e6', '#dbe9f0', '#f2dccb']);

  // Emblem and header.
  ctx.fillStyle = '#1d3f8f';
  ctx.beginPath();
  ctx.arc(0.065 * W, 0.095 * H, 0.06 * H, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'ID', 0.047 * 1, 0.115, 0.05, { color: '#f6d34a', weight: 800 });
  ctx.fillStyle = '#b8262b';
  ctx.fillRect(0.13 * W, 0.05 * H, 0.08 * W, 0.022 * H);
  ctx.fillStyle = '#f3c623';
  ctx.fillRect(0.13 * W, 0.072 * H, 0.08 * W, 0.044 * H);
  ctx.fillStyle = '#b8262b';
  ctx.fillRect(0.13 * W, 0.116 * H, 0.08 * W, 0.022 * H);
  text(ctx, 'DOCUMENTO DE IDENTIDAD', 0.25, 0.09, 0.055, { color: '#1d3f8f', weight: 800 });
  text(ctx, 'ESPÉCIMEN · SAMPLE IDENTITY CARD', 0.25, 0.13, 0.03, { color: '#b8262b', weight: 700 });

  // Card number (small, top left) and support number (top right).
  text(ctx, '99999999R', 0.02, 0.232, 0.045, { weight: 700 });
  text(ctx, 'BAA000000', 0.78, 0.195, 0.034, { weight: 700 });

  // Main number.
  text(ctx, 'DNI', 0.39, 0.235, 0.04, { color: '#6b4f3a', weight: 700 });
  text(ctx, '99999999R', 0.445, 0.24, 0.085, { weight: 800 });

  // Photo.
  const px = 0.025 * W, py = 0.28 * H, pw = 0.335 * W, ph = 0.69 * H;
  ctx.save();
  roundedPath(ctx, px, py, pw, ph, 0.02 * H);
  ctx.clip();
  const pg = ctx.createLinearGradient(0, py, 0, py + ph);
  pg.addColorStop(0, '#e9eef2');
  pg.addColorStop(1, '#cfd8df');
  ctx.fillStyle = pg;
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#6f7f8f';
  ctx.beginPath();
  ctx.ellipse(px + pw / 2, py + ph * 0.38, pw * 0.2, ph * 0.19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(px + pw / 2, py + ph * 1.02, pw * 0.44, ph * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Name.
  label(ctx, 'APELLIDOS / SURNAMES', 0.39, 0.325);
  text(ctx, 'ESPAÑOLA', 0.39, 0.375, 0.05);
  text(ctx, 'ESPAÑOLA', 0.39, 0.425, 0.05);
  label(ctx, 'NOMBRE / NAME', 0.39, 0.458);
  text(ctx, 'CARMEN', 0.39, 0.5, 0.05);

  // Sex and nationality (never covered by default).
  label(ctx, 'SEXO', 0.39, 0.54);
  text(ctx, 'F', 0.39, 0.572, 0.042);
  label(ctx, 'NACIONALIDAD', 0.5, 0.54);
  text(ctx, 'ESP', 0.5, 0.572, 0.042);

  // Date of birth.
  label(ctx, 'FECHA DE NACIMIENTO', 0.785, 0.515);
  text(ctx, '01 01 1980', 0.785, 0.562, 0.045);

  // Issue and expiry.
  label(ctx, 'EMISIÓN', 0.39, 0.603);
  text(ctx, '02 06 2021', 0.39, 0.645, 0.042);
  label(ctx, 'VALIDEZ', 0.58, 0.603);
  text(ctx, '02 06 2031', 0.58, 0.645, 0.042);

  // Support number field.
  label(ctx, 'NÚM. SOPORTE', 0.39, 0.718);
  text(ctx, 'BAA000000', 0.39, 0.757, 0.042);

  // Signature.
  ctx.strokeStyle = '#1a2a6c';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const sx = 0.45 * W, sy = 0.86 * H;
  ctx.moveTo(sx, sy);
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    ctx.lineTo(sx + t * 0.27 * W, sy - Math.sin(t * 13) * 0.04 * H * (1 - t * 0.4) - t * 0.03 * H);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 0.02 * W, sy + 0.02 * H);
  ctx.quadraticCurveTo(sx + 0.15 * W, sy + 0.035 * H, sx + 0.28 * W, sy - 0.005 * H);
  ctx.stroke();

  // CAN.
  label(ctx, 'CAN', 0.79, 0.84);
  text(ctx, '123456', 0.79, 0.895, 0.055, { weight: 700, font: MONO });

  text(ctx, 'ESPÉCIMEN SIN VALIDEZ · DATOS FICTICIOS', 0.39, 0.962, 0.026, { color: '#6b4f3a', weight: 600 });

  // Specimen stamp.
  ctx.save();
  ctx.translate(0.66 * W, 0.42 * H);
  ctx.rotate(-0.33);
  text(ctx, 'ESPÉCIMEN', 0, 0, 0.085, { color: 'rgba(184, 38, 43, 0.22)', weight: 900 });
  ctx.restore();
  ctx.restore();
  return c;
}

function dniBack(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#e3edf3', '#f1efe6', '#f3e2cf', '#e6eef2']);

  // Chip.
  const cx = 0.06 * W, cy = 0.22 * H, cw = 0.13 * W, ch = 0.22 * H;
  const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  g.addColorStop(0, '#f1d27a');
  g.addColorStop(1, '#b8902e');
  ctx.fillStyle = g;
  roundedPath(ctx, cx, cy, cw, ch, 0.03 * H);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 60, 10, 0.55)';
  ctx.lineWidth = 3;
  for (const f of [0.33, 0.66]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + ch * f);
    ctx.lineTo(cx + cw, cy + ch * f);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx + cw / 2, cy);
  ctx.lineTo(cx + cw / 2, cy + ch);
  ctx.stroke();

  // Decorative emblem on the right.
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(29, 63, 143, ${0.08 + i * 0.015})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0.82 * W, 0.3 * H, (0.04 + i * 0.03) * H, 0, Math.PI * 2);
    ctx.stroke();
  }

  label(ctx, 'DOMICILIO', 0.28, 0.078);
  text(ctx, 'C. DEL EJEMPLO 1, 2º B', 0.28, 0.125, 0.042);
  text(ctx, 'MADRID', 0.28, 0.17, 0.042);
  text(ctx, 'MADRID', 0.28, 0.212, 0.042);

  label(ctx, 'LUGAR DE NACIMIENTO', 0.28, 0.342);
  text(ctx, 'MADRID', 0.28, 0.39, 0.042);
  text(ctx, 'MADRID', 0.28, 0.437, 0.042);

  label(ctx, 'HIJA DE', 0.28, 0.517);
  text(ctx, 'JUAN / MARÍA', 0.28, 0.567, 0.042);

  label(ctx, 'EQUIPO 28000A1B2', 0.06, 0.52);

  // Machine readable zone (fictitious data).
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(0, 0.64 * H, W, 0.3 * H);
  const mrz = ['IDESPBAA000000999999999R<<<<<<', '8001011F3106028ESP<<<<<<<<<<<6', 'ESPANOLA<ESPANOLA<<CARMEN<<<<<'];
  mrz.forEach((line, i) => text(ctx, line, 0.045, 0.735 + i * 0.08, 0.078, { font: MONO, weight: 700, color: '#20252b' }));
  ctx.restore();
  return c;
}

/** Text rotated 90° counter-clockwise, as printed along the card edges. */
function verticalText(ctx: Ctx, t: string, fx: number, fy: number, size: number) {
  ctx.save();
  ctx.translate(fx * W, fy * H);
  ctx.rotate(-Math.PI / 2);
  text(ctx, t, 0, 0, size, { color: '#2b3440', weight: 600, font: MONO });
  ctx.restore();
}

/** Same ellipse-and-shoulders silhouette used for portraits. */
function portrait(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.38, w * 0.2, h * 0.19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 1.02, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
}

const frLabel = (ctx: Ctx, t: string, fx: number, fy: number) => text(ctx, t, fx, fy, 0.025, { color: '#2a3a6b', weight: 500 });
const FR_VALUE = '#16202c';

function cniFront(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#eef4fa', '#f8fbfd', '#e3eef7', '#f2f6fb']);

  // Header: tricolour block, title and a blue badge (no official emblems).
  ctx.fillStyle = '#23338a';
  ctx.fillRect(0.06 * W, 0.06 * H, 0.04 * W, 0.12 * H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0.1 * W, 0.06 * H, 0.04 * W, 0.12 * H);
  ctx.fillStyle = '#e1000f';
  ctx.fillRect(0.14 * W, 0.06 * H, 0.04 * W, 0.12 * H);
  text(ctx, "CARTE D'IDENTITÉ · SPÉCIMEN", 0.22, 0.125, 0.055, { color: '#23338a', weight: 800 });
  text(ctx, 'SAMPLE IDENTITY CARD · DONNÉES FICTIVES', 0.22, 0.17, 0.028, { color: '#2a3a6b', weight: 600 });
  ctx.fillStyle = '#23338a';
  ctx.fillRect(0.82 * W, 0.06 * H, 0.11 * W, 0.12 * H);
  text(ctx, 'FR', 0.851, 0.142, 0.06, { color: '#f6d34a', weight: 800 });

  // Repeated prints: tiny expiry date on top, document number along the left edge.
  text(ctx, '01.01.2033', 0.664, 0.03, 0.018, { color: '#2b3440', weight: 600 });
  verticalText(ctx, 'AB12CD345', 0.022, 0.42, 0.022);

  // Main photo and ghost portrait.
  const px = 0.06 * W, py = 0.23 * H, pw = 0.31 * W, ph = 0.68 * H;
  ctx.save();
  roundedPath(ctx, px, py, pw, ph, 0.02 * H);
  ctx.clip();
  ctx.fillStyle = '#e6ebef';
  ctx.fillRect(px, py, pw, ph);
  portrait(ctx, px, py, pw, ph, '#6f7882');
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.45;
  portrait(ctx, 0.3 * W, 0.33 * H, 0.13 * W, 0.3 * H, '#7fb069');
  ctx.restore();

  frLabel(ctx, 'NOM / Surname', 0.4, 0.235);
  text(ctx, 'DUPONT', 0.4, 0.29, 0.05, { color: FR_VALUE });
  frLabel(ctx, 'Prénoms / Given names', 0.4, 0.345);
  text(ctx, 'Camille, Marie', 0.4, 0.398, 0.048, { color: FR_VALUE, weight: 500 });

  frLabel(ctx, 'SEXE / Sex', 0.4, 0.485);
  text(ctx, 'F', 0.4, 0.53, 0.042, { color: FR_VALUE });
  frLabel(ctx, 'NATIONALITÉ', 0.52, 0.485);
  text(ctx, 'FRA', 0.52, 0.53, 0.042, { color: FR_VALUE });
  frLabel(ctx, 'DATE DE NAISS.', 0.737, 0.485);
  text(ctx, '01 01 1990', 0.737, 0.528, 0.045, { color: FR_VALUE });

  frLabel(ctx, 'LIEU DE NAISSANCE / Place of birth', 0.4, 0.565);
  text(ctx, 'LYON', 0.4, 0.605, 0.042, { color: FR_VALUE });
  frLabel(ctx, "NOM D'USAGE / Alternate name", 0.4, 0.645);
  text(ctx, 'MARTIN', 0.4, 0.687, 0.042, { color: FR_VALUE });

  frLabel(ctx, 'N° DU DOCUMENT / Document No.', 0.4, 0.728);
  text(ctx, 'AB12CD345', 0.4, 0.785, 0.06, { color: FR_VALUE, weight: 800 });
  frLabel(ctx, "DATE D'EXPIR. / Expiry date", 0.737, 0.725);
  text(ctx, '01 01 2033', 0.737, 0.765, 0.042, { color: FR_VALUE });

  // Signature.
  ctx.strokeStyle = '#1b2440';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const sx = 0.455 * W, sy = 0.88 * H;
  ctx.moveTo(sx, sy);
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    ctx.lineTo(sx + t * 0.17 * W, sy - Math.sin(t * 11) * 0.035 * H - t * 0.025 * H);
  }
  ctx.stroke();

  // CAN.
  text(ctx, '654321', 0.735, 0.885, 0.055, { color: FR_VALUE, weight: 700, font: MONO });

  ctx.save();
  ctx.translate(0.62 * W, 0.47 * H);
  ctx.rotate(-0.33);
  text(ctx, 'SPÉCIMEN', 0, 0, 0.085, { color: 'rgba(35, 51, 138, 0.16)', weight: 900 });
  ctx.restore();
  ctx.restore();
  return c;
}

/** Deterministic pseudo-random pattern that looks like a 2D barcode. */
function fakeMatrix(ctx: Ctx, x: number, y: number, size: number, cells: number) {
  const cell = size / cells;
  let seed = 1234567;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - cell, y - cell, size + 2 * cell, size + 2 * cell);
  ctx.fillStyle = '#111111';
  for (let r = 0; r < cells; r++) {
    for (let col = 0; col < cells; col++) {
      const finder = (r < 7 && col < 7) || (r < 7 && col >= cells - 7) || (r >= cells - 7 && col < 7);
      const on = finder ? r % 6 === 0 || col % 6 === 0 || (r % 6 > 1 && r % 6 < 5 && col % 6 > 1 && col % 6 < 5) : rnd() > 0.5;
      if (on) ctx.fillRect(x + col * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

function cniBack(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#e8f1f8', '#f7fafc', '#e6eff7', '#f3f7fb']);

  text(ctx, '01.01.2033', 0.284, 0.022, 0.018, { color: '#2b3440', weight: 600 });

  // 2D-Doc style seal and chip.
  fakeMatrix(ctx, 0.11 * W, 0.07 * H, 0.22 * H, 25);
  const cx = 0.105 * W, cy = 0.34 * H, cw = 0.14 * W, ch = 0.21 * H;
  const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  g.addColorStop(0, '#e9c876');
  g.addColorStop(1, '#a9832c');
  ctx.fillStyle = g;
  roundedPath(ctx, cx, cy, cw, ch, 0.03 * H);
  ctx.fill();
  verticalText(ctx, '123456789012', 0.06, 0.53, 0.026);

  frLabel(ctx, 'TAILLE / Height', 0.275, 0.085);
  text(ctx, '1,70 m', 0.275, 0.127, 0.042, { color: FR_VALUE });
  frLabel(ctx, 'DATE DE DÉLIVRANCE / Date of issue', 0.425, 0.085);
  text(ctx, '01 01 2023', 0.425, 0.127, 0.042, { color: FR_VALUE });
  frLabel(ctx, 'ADRESSE / Address', 0.275, 0.185);
  text(ctx, "1 RUE DE L'EXEMPLE", 0.275, 0.232, 0.036, { color: FR_VALUE, weight: 500 });
  text(ctx, '69000 LYON', 0.275, 0.28, 0.036, { color: FR_VALUE, weight: 500 });
  text(ctx, 'FRANCE', 0.275, 0.328, 0.036, { color: FR_VALUE, weight: 500 });

  // Ghost portrait and repeated document number on the right edge.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#dfe5ea';
  ctx.fillRect(0.76 * W, 0.07 * H, 0.17 * W, 0.26 * H);
  portrait(ctx, 0.76 * W, 0.07 * H, 0.17 * W, 0.26 * H, '#59636d');
  ctx.restore();
  verticalText(ctx, 'AB12CD345', 0.99, 0.42, 0.02);

  // Stripe and machine readable zone (fictitious data).
  ctx.fillStyle = '#23338a';
  ctx.fillRect(0.05 * W, 0.6 * H, 0.3 * W, 0.012 * H);
  ctx.fillStyle = '#e1000f';
  ctx.fillRect(0.65 * W, 0.6 * H, 0.3 * W, 0.012 * H);
  text(ctx, 'SPÉCIMEN SANS VALEUR', 0.39, 0.62, 0.032, { color: '#23338a', weight: 800 });
  const mrz = ['IDFRAAB12CD3450<<<<<<<<<<<<<<<', '9001010F3301010FRA<<<<<<<<<<<0', 'DUPONT<<CAMILLE<MARIE<<<<<<<<<'];
  mrz.forEach((line, i) => text(ctx, line, 0.06, 0.755 + i * 0.075, 0.068, { font: MONO, weight: 700, color: '#20252b' }));
  ctx.restore();
  return c;
}

export function sampleCards(id: DocumentId = 'dni-es'): { front: HTMLCanvasElement; back: HTMLCanvasElement } {
  return id === 'cni-fr'
    ? { front: cniFront(), back: cniBack() }
    : { front: dniFront(), back: dniBack() };
}
