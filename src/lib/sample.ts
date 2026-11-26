import { createCanvas, ctx2d } from './image';

/**
 * Draws a fictitious ID card used as an example. It follows the layout of the
 * Spanish DNI so the default zones line up, but it contains made-up data and
 * none of the official artwork.
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

function anverso(): HTMLCanvasElement {
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

function reverso(): HTMLCanvasElement {
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

export function sampleCards(): { anverso: HTMLCanvasElement; reverso: HTMLCanvasElement } {
  return { anverso: anverso(), reverso: reverso() };
}
