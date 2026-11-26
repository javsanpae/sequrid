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

const itLabel = (ctx: Ctx, t: string, fx: number, fy: number) => text(ctx, t, fx, fy, 0.022, { color: '#33465e', weight: 500 });
const IT_VALUE = '#141c26';

function cieFront(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#e7f1ef', '#f6f9f4', '#eaf1f6', '#f4f1ea']);

  // Header: tricolour block and title (no official emblems).
  ctx.fillStyle = '#009246';
  ctx.fillRect(0.035 * W, 0.05 * H, 0.03 * W, 0.08 * H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0.065 * W, 0.05 * H, 0.03 * W, 0.08 * H);
  ctx.fillStyle = '#ce2b37';
  ctx.fillRect(0.095 * W, 0.05 * H, 0.03 * W, 0.08 * H);
  text(ctx, 'CARTA DI IDENTITÀ · FACSIMILE', 0.15, 0.1, 0.048, { color: '#1c3a7a', weight: 800 });
  text(ctx, 'SAMPLE IDENTITY CARD · DATI FITTIZI', 0.15, 0.14, 0.024, { color: '#33465e', weight: 600 });

  // Card number (top right) and issuing municipality.
  text(ctx, 'CA00000ZZ', 0.76, 0.095, 0.045, { color: IT_VALUE, weight: 600 });
  itLabel(ctx, 'COMUNE DI / MUNICIPALITY', 0.15, 0.228);
  text(ctx, 'BORGO ESEMPIO', 0.15, 0.266, 0.034, { color: IT_VALUE, weight: 700 });

  // Photo and the small portrait in the top right area.
  const px = 0.035 * W, py = 0.33 * H, pw = 0.265 * W, ph = 0.52 * H;
  ctx.save();
  roundedPath(ctx, px, py, pw, ph, 0.02 * H);
  ctx.clip();
  ctx.fillStyle = '#e4e9ec';
  ctx.fillRect(px, py, pw, ph);
  portrait(ctx, px, py, pw, ph, '#68727c');
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#d7dde2';
  ctx.fillRect(0.8 * W, 0.17 * H, 0.14 * W, 0.22 * H);
  portrait(ctx, 0.8 * W, 0.17 * H, 0.14 * W, 0.22 * H, '#5b6670');
  ctx.restore();

  itLabel(ctx, 'COGNOME / SURNAME', 0.328, 0.315);
  text(ctx, 'VERDI', 0.328, 0.355, 0.042, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'NOME / NAME', 0.328, 0.385);
  text(ctx, 'GIULIA', 0.328, 0.422, 0.042, { color: IT_VALUE, weight: 700 });

  itLabel(ctx, 'LUOGO E DATA DI NASCITA / PLACE AND DATE OF BIRTH', 0.328, 0.475);
  text(ctx, 'FIRENZE (FI) 15.03.1992', 0.328, 0.528, 0.042, { color: IT_VALUE, weight: 700 });

  itLabel(ctx, 'SESSO / SEX', 0.328, 0.578);
  text(ctx, 'F', 0.328, 0.625, 0.04, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'STATURA', 0.48, 0.578);
  text(ctx, '168', 0.48, 0.625, 0.04, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'CITTADINANZA', 0.65, 0.578);
  text(ctx, 'ITA', 0.65, 0.625, 0.04, { color: IT_VALUE, weight: 700 });

  itLabel(ctx, 'EMISSIONE / ISSUING', 0.328, 0.68);
  text(ctx, '01.06.2023', 0.328, 0.716, 0.03, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'SCADENZA / EXPIRY', 0.655, 0.68);
  text(ctx, '15.03.2034', 0.655, 0.716, 0.03, { color: IT_VALUE, weight: 700 });

  // Signature.
  itLabel(ctx, 'FIRMA DEL TITOLARE', 0.328, 0.77);
  ctx.strokeStyle = '#18233f';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const sx = 0.335 * W, sy = 0.865 * H;
  ctx.moveTo(sx, sy);
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    ctx.lineTo(sx + t * 0.23 * W, sy - Math.sin(t * 12) * 0.03 * H - t * 0.02 * H);
  }
  ctx.stroke();

  // CAN.
  text(ctx, '654321', 0.76, 0.868, 0.055, { color: IT_VALUE, weight: 700, font: MONO });

  // Tricolour line at the bottom.
  ctx.fillStyle = '#009246';
  ctx.fillRect(0, 0.93 * H, W / 3, 0.012 * H);
  ctx.fillStyle = '#ce2b37';
  ctx.fillRect((2 * W) / 3, 0.93 * H, W / 3, 0.012 * H);

  ctx.save();
  ctx.translate(0.2 * W, 0.86 * H);
  ctx.rotate(-0.55);
  text(ctx, 'FACSIMILE', 0, 0, 0.11, { color: 'rgba(206, 43, 55, 0.18)', weight: 900 });
  ctx.restore();
  ctx.restore();
  return c;
}

/** Deterministic bars that look like the tax code barcode. */
function fakeBarcode(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  let seed = 7654321;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  ctx.fillStyle = '#111111';
  const pad = w * 0.05;
  for (let bx = x + pad; bx < x + w - pad; ) {
    const bar = 2 + Math.floor(rnd() * 3) * 2;
    ctx.fillRect(bx, y + h * 0.1, bar, h * 0.8);
    bx += bar + 2 + Math.floor(rnd() * 3) * 2;
  }
}

function cieBack(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#e3f0f2', '#f4f8f6', '#e9f2f4', '#f2f4ef']);

  itLabel(ctx, 'COGNOME E NOME DEI GENITORI / PARENTS’ NAMES', 0.05, 0.085);
  text(ctx, 'VERDI MARIO · BIANCHI ANNA', 0.05, 0.135, 0.036, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'CODICE FISCALE / FISCAL CODE', 0.05, 0.19);
  text(ctx, 'VRDGLI92C55D612X', 0.05, 0.245, 0.04, { color: IT_VALUE, weight: 700, font: MONO });
  itLabel(ctx, 'ESTREMI ATTO DI NASCITA', 0.45, 0.19);
  text(ctx, '00000.0.A00', 0.45, 0.226, 0.032, { color: IT_VALUE, weight: 700 });
  itLabel(ctx, 'INDIRIZZO DI RESIDENZA / RESIDENCE', 0.05, 0.29);
  text(ctx, 'VIA DELL’ESEMPIO, 1 · BORGO ESEMPIO', 0.05, 0.328, 0.032, { color: IT_VALUE, weight: 700 });

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#d7dde2';
  ctx.fillRect(0.82 * W, 0.14 * H, 0.12 * W, 0.23 * H);
  portrait(ctx, 0.82 * W, 0.14 * H, 0.12 * W, 0.23 * H, '#5b6670');
  ctx.restore();

  fakeBarcode(ctx, 0.05 * W, 0.475 * H, 0.9 * W, 0.19 * H);

  // Machine readable zone (fictitious data).
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(0, 0.7 * H, W, 0.28 * H);
  const mrz = ['C<ITACA00000ZZ4<<<<<<<<<<<<<<<', '9203151F3403152ITA<<<<<<<<<<<6', 'VERDI<<GIULIA<<<<<<<<<<<<<<<<<'];
  mrz.forEach((line, i) => text(ctx, line, 0.06, 0.79 + i * 0.075, 0.068, { font: MONO, weight: 700, color: '#20252b' }));
  ctx.restore();
  return c;
}

const EN_VALUE = '#161c28';
const num = (ctx: Ctx, t: string, fx: number, fy: number) => text(ctx, t, fx, fy, 0.024, { color: '#4a3a5c', weight: 500 });

/** UK photocard licence: Great Britain and Northern Ireland share the layout. */
function licenceFront(variant: 'gb' | 'ni'): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#f6e3ee', '#fbf1f5', '#e6eef8', '#f4e6f0']);
  const gb = variant === 'gb';

  text(ctx, 'UK', 0.04, 0.115, 0.075, { color: '#23338a', weight: 900 });
  text(ctx, 'DRIVING LICENCE · SPECIMEN', 0.19, 0.1, 0.048, { color: '#23338a', weight: 800 });
  text(ctx, 'SAMPLE · FICTITIOUS DATA', 0.19, 0.145, 0.024, { color: '#4a3a5c', weight: 600 });

  // Photo with a laser-engraved date, and the ghost image below it.
  const px = 0.06 * W, py = 0.25 * H, pw = 0.21 * W, ph = 0.4 * H;
  ctx.save();
  roundedPath(ctx, px, py, pw, ph, 0.015 * H);
  ctx.clip();
  ctx.fillStyle = '#e2e4e8';
  ctx.fillRect(px, py, pw, ph);
  portrait(ctx, px, py, pw, ph, '#6a7078');
  ctx.restore();
  text(ctx, gb ? '01.06.2023' : '31.05.2033', 0.065, 0.642, 0.022, { color: '#1a1a1a', weight: 700 });
  ctx.save();
  ctx.globalAlpha = 0.35;
  portrait(ctx, 0.1 * W, 0.72 * H, 0.14 * W, 0.17 * H, '#7a7f88');
  ctx.restore();

  num(ctx, '1.', 0.315, 0.215);
  text(ctx, 'SAMPLE', 0.355, 0.215, 0.044, { color: EN_VALUE, weight: 600 });
  num(ctx, '2.', 0.315, 0.265);
  text(ctx, 'ALEX', 0.355, 0.265, 0.042, { color: EN_VALUE, weight: 600 });
  text(ctx, 'JORDAN', 0.355, 0.31, 0.042, { color: EN_VALUE, weight: 600 });
  num(ctx, '3.', 0.315, 0.385);
  text(ctx, gb ? '01.02.1990 LEEDS' : '01.02.1990 BELFAST', 0.355, 0.385, 0.038, { color: EN_VALUE, weight: 600 });
  num(ctx, '4a.', 0.305, 0.438);
  text(ctx, '01.06.2023', 0.355, 0.438, 0.036, { color: EN_VALUE, weight: 600 });
  num(ctx, '4c.', 0.515, 0.438);
  text(ctx, gb ? 'DVLA' : 'DVA', 0.555, 0.438, 0.036, { color: EN_VALUE, weight: 600 });
  num(ctx, '4b.', 0.305, 0.493);
  text(ctx, '31.05.2033', 0.355, 0.493, 0.036, { color: EN_VALUE, weight: 600 });
  num(ctx, '5.', 0.315, 0.548);
  text(ctx, gb ? 'SAMPL902010AJ9XY 01' : '12345678', 0.355, 0.548, 0.036, { color: EN_VALUE, weight: 600 });
  num(ctx, '7.', 0.315, 0.61);

  ctx.strokeStyle = '#1b2440';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const sx = 0.4 * W, sy = 0.68 * H;
  ctx.moveTo(sx, sy);
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    ctx.lineTo(sx + t * 0.25 * W, sy - Math.sin(t * 10) * 0.03 * H - t * 0.02 * H);
  }
  ctx.stroke();

  num(ctx, '8.', 0.315, 0.77);
  text(ctx, '1 EXAMPLE STREET,', 0.355, 0.77, 0.032, { color: EN_VALUE, weight: 600 });
  text(ctx, 'SAMPLETOWN', 0.355, 0.81, 0.032, { color: EN_VALUE, weight: 600 });
  text(ctx, gb ? 'AB1 2CD' : 'BT1 1AA', 0.355, 0.85, 0.032, { color: EN_VALUE, weight: 600 });
  num(ctx, '9.', 0.315, 0.915);
  text(ctx, 'AM/A/B1/B/f/k/q', 0.355, 0.915, 0.032, { color: EN_VALUE, weight: 600 });

  ctx.save();
  ctx.translate(0.6 * W, 0.62 * H);
  ctx.rotate(-0.4);
  text(ctx, 'SPECIMEN', 0, 0, 0.09, { color: 'rgba(35, 51, 138, 0.15)', weight: 900 });
  ctx.restore();
  ctx.restore();
  return c;
}

function licenceBack(variant: 'gb' | 'ni'): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#f6e3ee', '#fbf1f5', '#efe8f6', '#f4e6f0']);

  // Categories (9), valid from (10), valid to (11) and codes (12).
  const cols = [0.28, 0.43, 0.55, 0.68, 0.87];
  ctx.strokeStyle = 'rgba(40, 30, 60, 0.5)';
  ctx.lineWidth = 2;
  for (const x of cols) {
    ctx.beginPath();
    ctx.moveTo(x * W, 0.05 * H);
    ctx.lineTo(x * W, 0.85 * H);
    ctx.stroke();
  }
  num(ctx, '9.', 0.33, 0.075);
  num(ctx, '10.', 0.47, 0.075);
  num(ctx, '11.', 0.59, 0.075);
  num(ctx, '12.', 0.75, 0.075);
  const rows = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE', 'f/k/q'];
  rows.forEach((cat, i) => {
    const y = 0.12 + i * 0.046;
    ctx.beginPath();
    ctx.moveTo(cols[0] * W, (y + 0.012) * H);
    ctx.lineTo(cols[4] * W, (y + 0.012) * H);
    ctx.stroke();
    text(ctx, cat, 0.29, y, 0.03, { color: EN_VALUE, weight: 600 });
    if (cat === 'AM' || cat === 'B' || cat === 'B1' || cat === 'f/k/q') {
      text(ctx, '15.03.10', 0.445, y, 0.03, { color: EN_VALUE, weight: 600 });
      text(ctx, '14.03.40', 0.565, y, 0.03, { color: EN_VALUE, weight: 600 });
    }
    if (cat === 'B') text(ctx, '01', 0.7, y, 0.03, { color: EN_VALUE, weight: 700 });
  });

  // Decorative symbol on the left (not an official emblem).
  ctx.fillStyle = variant === 'gb' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(184, 144, 46, 0.7)';
  ctx.beginPath();
  ctx.arc(0.13 * W, 0.3 * H, 0.08 * H, 0, Math.PI * 2);
  ctx.fill();

  verticalText(ctx, '1. Surname 2. First names 3. Date and place of birth', 0.94, 0.85, 0.02);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(0.7 * W, 0.915 * H, 0.24 * W, 0.065 * H);
  text(ctx, 'ZZ00000001', 0.72, 0.965, 0.034, { color: EN_VALUE, weight: 600, font: MONO });
  ctx.restore();
  return c;
}

const usLabel = (ctx: Ctx, t: string, fx: number, fy: number) => text(ctx, t, fx, fy, 0.026, { color: '#2a3a58', weight: 500 });

function passportCardFront(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#e4eef8', '#f4f7fb', '#e8f0f7', '#f6eef0']);

  text(ctx, 'PASSPORT CARD · SPECIMEN', 0.07, 0.1, 0.052, { color: '#1f3b73', weight: 800 });
  text(ctx, 'SAMPLE · FICTITIOUS DATA · NOT VALID', 0.07, 0.152, 0.026, { color: '#9b2335', weight: 700 });

  const px = 0.035 * W, py = 0.23 * H, pw = 0.3 * W, ph = 0.6 * H;
  ctx.save();
  roundedPath(ctx, px, py, pw, ph, 0.015 * H);
  ctx.clip();
  ctx.fillStyle = '#e2e6ea';
  ctx.fillRect(px, py, pw, ph);
  portrait(ctx, px, py, pw, ph, '#666e78');
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.35;
  portrait(ctx, 0.845 * W, 0.47 * H, 0.12 * W, 0.22 * H, '#5d6670');
  ctx.restore();

  usLabel(ctx, 'Nationality', 0.4, 0.25);
  text(ctx, 'USA', 0.4, 0.292, 0.036, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Passport Card no.', 0.72, 0.232);
  text(ctx, 'C00000000', 0.72, 0.296, 0.045, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Surname', 0.4, 0.365);
  text(ctx, 'SAMPLE', 0.4, 0.41, 0.042, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Given Names', 0.4, 0.455);
  text(ctx, 'ALEX JORDAN', 0.4, 0.5, 0.042, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Sex', 0.45, 0.598);
  text(ctx, 'F', 0.45, 0.652, 0.04, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Date of Birth', 0.58, 0.598);
  text(ctx, '1 JAN 1990', 0.58, 0.655, 0.04, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Place of Birth', 0.48, 0.708);
  text(ctx, 'TEXAS, U.S.A.', 0.48, 0.765, 0.04, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Issued On', 0.49, 0.812);
  text(ctx, '1 JUN 2023', 0.49, 0.866, 0.036, { color: EN_VALUE, weight: 600 });
  usLabel(ctx, 'Expires On', 0.705, 0.812);
  text(ctx, '31 MAY 2033', 0.705, 0.866, 0.036, { color: EN_VALUE, weight: 600 });

  // Control numbers.
  text(ctx, 'Z-0000000-00', 0.065, 0.905, 0.03, { color: EN_VALUE, weight: 700 });
  text(ctx, '0-00000-0', 0.81, 0.91, 0.025, { color: EN_VALUE, weight: 600 });
  verticalText(ctx, '00000-Z00Z', 0.022, 0.86, 0.022);
  ctx.restore();
  return c;
}

function passportCardBack(): HTMLCanvasElement {
  const c = createCanvas(W, H);
  const ctx = ctx2d(c);
  cardBase(ctx, ['#dff0f2', '#f2f8f9', '#e3eff4', '#f0f4f6']);

  text(ctx, 'PASSPORT CARD · SPECIMEN', 0.2, 0.1, 0.04, { color: '#1f3b73', weight: 800 });
  text(ctx, '00000.', 0.7, 0.175, 0.03, { color: EN_VALUE, weight: 600 });
  text(ctx, 'Sample card for testing.', 0.07, 0.24, 0.03, { color: '#2a3a58', weight: 500 });
  text(ctx, 'Not a travel document.', 0.07, 0.29, 0.03, { color: '#2a3a58', weight: 500 });
  text(ctx, 'C00000000', 0.75, 0.43, 0.045, { color: EN_VALUE, weight: 700 });
  fakeBarcode(ctx, 0.045 * W, 0.455 * H, 0.3 * W, 0.1 * H);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(0, 0.64 * H, W, 0.3 * H);
  const mrz = ['IPUSAC000000000<<<<<<<<<<<<<<<', '9001010F3305310USA<<<<<<<<<<<0', 'SAMPLE<<ALEX<JORDAN<<<<<<<<<<<'];
  mrz.forEach((line, i) => text(ctx, line, 0.055, 0.735 + i * 0.07, 0.064, { font: MONO, weight: 700, color: '#20252b' }));
  ctx.restore();
  return c;
}

export function sampleCards(id: DocumentId = 'dni-es'): { front: HTMLCanvasElement; back: HTMLCanvasElement } {
  switch (id) {
    case 'cni-fr':
      return { front: cniFront(), back: cniBack() };
    case 'cie-it':
      return { front: cieFront(), back: cieBack() };
    case 'dl-gb':
      return { front: licenceFront('gb'), back: licenceBack('gb') };
    case 'dl-ni':
      return { front: licenceFront('ni'), back: licenceBack('ni') };
    case 'ppc-us':
      return { front: passportCardFront(), back: passportCardBack() };
    default:
      return { front: dniFront(), back: dniBack() };
  }
}
