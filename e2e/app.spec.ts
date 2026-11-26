import { expect, test, type Page, type Request } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// 1×1 PNG, used to exercise the real upload path.
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Records every request the page makes from now on. */
function trackRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (r) => requests.push(r));
  return requests;
}

async function loadSample(page: Page) {
  await page.getByRole('button', { name: 'Probar con un ejemplo' }).click();
  await expect(page.getByRole('button', { name: /DNI 1 · Anverso: cargada/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /DNI 1 · Reverso: cargada/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Protege tu DNI antes de enviarlo');
});

test('only loads its own static files and never talks to anyone while working', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const all = trackRequests(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  for (const r of all) {
    expect(new URL(r.url()).origin, r.url()).toBe(origin);
    expect(r.method()).toBe('GET');
  }

  const during = trackRequests(page);
  await loadSample(page);
  await page.getByLabel('Destinatario').fill('Inmobiliaria Sol');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar PDF' }).first().click();
  await download;
  const network = during.filter((r) => !r.url().startsWith('blob:') && !r.url().startsWith('data:'));
  expect(network.map((r) => r.url())).toEqual([]);
});

test('loads the sample and recommends a high protection level', async ({ page }) => {
  await loadSample(page);
  await expect(page.getByText(/Protección alta\./)).toBeVisible();
  await expect(page.getByText(/Has tapado 7 de 7 datos recomendados/)).toBeVisible();
  await expect(page.locator('.overlay .zone')).not.toHaveCount(0);
});

test('presets change what is covered and the watermark', async ({ page }) => {
  await page.getByLabel('Uso').selectOption('banco');
  await page.getByLabel('Destinatario').fill('Banco Ejemplo');
  await expect(page.getByLabel('Texto de la marca de agua')).toHaveText(/^SOLO PARA IDENTIFICACIÓN BANCARIA · BANCO EJEMPLO · \d{2}\/\d{2}\/\d{4}$/);
  await expect(page.getByRole('checkbox', { name: 'Código CAN' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Firma' })).not.toBeChecked();

  await page.getByLabel('Texto propio').fill('solo para Ana');
  await expect(page.getByLabel('Texto de la marca de agua')).toHaveText('SOLO PARA ANA');
});

test('protection level reacts to uncovering data and removing the watermark', async ({ page }) => {
  await loadSample(page);
  await page.getByRole('checkbox', { name: 'Código CAN' }).uncheck();
  await expect(page.getByText(/Has tapado 6 de 7/)).toBeVisible();
  await page.getByRole('switch', { name: 'Añadir marca de agua' }).uncheck({ force: true });
  await expect(page.getByText(/Sin marca de agua/)).toBeVisible();
});

test('downloads a PDF with both faces', async ({ page }) => {
  await loadSample(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar PDF' }).first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('dni-protegido.pdf');
  const bytes = await readFile((await download.path())!);
  const text = bytes.toString('latin1');
  expect(text.startsWith('%PDF-')).toBe(true);
  expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
  expect(text).toContain('/Count 1');
});

test('downloads JPGs without metadata', async ({ page }) => {
  await loadSample(page);
  const [face] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG de esta cara' }).click()]);
  expect(face.suggestedFilename()).toBe('dni-protegido-dni1-anverso.jpg');
  const bytes = await readFile((await face.path())!);
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);
  expect(bytes.includes(Buffer.from('Exif'))).toBe(false);

  const [all] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG con todas' }).click()]);
  expect(all.suggestedFilename()).toBe('dni-protegido.jpg');
});

test('uploads a photo through the file picker', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /DNI 1 · Reverso: vacía/ }).click();
  await (await chooser).setFiles({ name: 'reverso.png', mimeType: 'image/png', buffer: PNG_1PX });
  await expect(page.getByRole('button', { name: /DNI 1 · Reverso: cargada/ })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Foto cargada en DNI 1 · Reverso');
});

test('several files fill the free slots and enable the second DNI', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /DNI 1 · Anverso: vacía/ }).click();
  const files = ['a', 'b', 'c'].map((n) => ({ name: `${n}.png`, mimeType: 'image/png', buffer: PNG_1PX }));
  await (await chooser).setFiles(files);
  await expect(page.getByRole('button', { name: /DNI 2 · Anverso: cargada/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /DNI 2 · Reverso: vacía/ })).toBeVisible();
});

test('zones can be removed with the keyboard and drawn by hand', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard and mouse flow');
  await loadSample(page);
  const canvas = page.getByRole('application');
  await canvas.focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.zone.selected')).toHaveCount(1);
  const before = await page.locator('.overlay .zone').count();
  await page.keyboard.press('Delete');
  // The first zone is the support number, which has two zones on the front.
  await expect(page.locator('.overlay .zone')).toHaveCount(before - 2);
  await expect(page.getByRole('checkbox', { name: 'Número de soporte' })).not.toBeChecked();
  await expect(page.getByRole('status')).toContainText('Número de soporte queda visible');

  await page.getByRole('radio', { name: 'Dibujar' }).click();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('.zone.custom')).toHaveCount(1);
});

test('compare view and framing tool', async ({ page }) => {
  await loadSample(page);
  await page.getByRole('radio', { name: 'Antes / después' }).click();
  await expect(page.getByText('Original', { exact: true })).toBeVisible();
  await expect(page.getByText('Protegida', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Editar' }).click();
  await page.getByRole('radio', { name: 'Encuadre' }).click();
  await expect(page.locator('.frame')).toBeVisible();
  await page.getByRole('button', { name: 'Girar 90 grados' }).click();
  await expect(page.locator('.frame')).toBeVisible();
});

test('layout fits the screen without horizontal scroll', async ({ page }) => {
  await loadSample(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  if (process.env.SCREENSHOTS) {
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}-top.png` });
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}-full.png`, fullPage: true });
  }
});

test('mobile shows a sticky download bar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await loadSample(page);
  const bar = page.locator('.mobile-bar');
  await expect(bar).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), bar.getByRole('button', { name: 'Descargar PDF' }).click()]);
  expect(download.suggestedFilename()).toBe('dni-protegido.pdf');
});
