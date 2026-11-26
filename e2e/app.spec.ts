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
  await page.getByRole('button', { name: 'Try with a sample' }).click();
  await expect(page.getByRole('button', { name: /DNI 1 · Front: loaded/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /DNI 1 · Back: loaded/ })).toBeVisible();
}

const heading = (page: Page) => page.getByRole('heading', { level: 1 });
const usageSelect = (page: Page) => page.getByRole('combobox', { name: /^Use\b/ });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(heading(page)).toBeVisible();
});

test('starts in English for an English browser', async ({ page }) => {
  await expect(heading(page)).toHaveText('Protect your ID card before sending it');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Sequrid · Protect your ID card');
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
  await page.getByLabel('Recipient').fill('Sunrise Lettings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).first().click();
  await download;
  const network = during.filter((r) => !r.url().startsWith('blob:') && !r.url().startsWith('data:'));
  expect(network.map((r) => r.url())).toEqual([]);
});

test('loads the sample and recommends a high protection level', async ({ page }) => {
  await loadSample(page);
  await expect(page.getByText(/High protection\./)).toBeVisible();
  await expect(page.getByText(/You have covered 7 of 7 recommended details/)).toBeVisible();
  await expect(page.locator('.overlay .zone')).not.toHaveCount(0);
});

test('presets change what is covered and the watermark', async ({ page }) => {
  await usageSelect(page).selectOption('bank');
  await page.getByLabel('Recipient').fill('Example Bank');
  await expect(page.getByLabel('Watermark text')).toHaveText(/^ONLY FOR BANK IDENTIFICATION · EXAMPLE BANK · \d{2}\/\d{2}\/\d{4}$/);
  await expect(page.getByRole('checkbox', { name: 'CAN code' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Signature' })).not.toBeChecked();

  await page.getByLabel('Custom text').fill('only for Ana');
  await expect(page.getByLabel('Watermark text')).toHaveText('ONLY FOR ANA');
});

test('protection level reacts to uncovering data and removing the watermark', async ({ page }) => {
  await loadSample(page);
  await page.getByRole('checkbox', { name: 'CAN code' }).uncheck();
  await expect(page.getByText(/You have covered 6 of 7/)).toBeVisible();
  await page.getByRole('switch', { name: 'Add watermark' }).uncheck({ force: true });
  await expect(page.getByText(/Without a watermark/)).toBeVisible();
});

test('downloads a PDF with both faces', async ({ page }) => {
  await loadSample(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('dni-protected.pdf');
  const bytes = await readFile((await download.path())!);
  const text = bytes.toString('latin1');
  expect(text.startsWith('%PDF-')).toBe(true);
  expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
  expect(text).toContain('/Count 1');
});

test('downloads JPGs without metadata', async ({ page }) => {
  await loadSample(page);
  const [face] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG of this side' }).click()]);
  expect(face.suggestedFilename()).toBe('dni-protected-dni1-front.jpg');
  const bytes = await readFile((await face.path())!);
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);
  expect(bytes.includes(Buffer.from('Exif'))).toBe(false);

  const [all] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG with all sides' }).click()]);
  expect(all.suggestedFilename()).toBe('dni-protected.jpg');
});

test('uploads a photo through the file picker', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /DNI 1 · Back: empty/ }).click();
  await (await chooser).setFiles({ name: 'back.png', mimeType: 'image/png', buffer: PNG_1PX });
  await expect(page.getByRole('button', { name: /DNI 1 · Back: loaded/ })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Photo loaded into DNI 1 · Back');
});

test('several files fill the free slots and enable the second DNI', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /DNI 1 · Front: empty/ }).click();
  const files = ['a', 'b', 'c'].map((n) => ({ name: `${n}.png`, mimeType: 'image/png', buffer: PNG_1PX }));
  await (await chooser).setFiles(files);
  await expect(page.getByRole('button', { name: /DNI 2 · Front: loaded/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /DNI 2 · Back: empty/ })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('3 photos placed in the free slots.');
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
  await expect(page.getByRole('checkbox', { name: 'Card serial number' })).not.toBeChecked();
  await expect(page.getByRole('status')).toContainText('Card serial number is now visible');

  await page.getByRole('radio', { name: 'Draw' }).click();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('.zone.custom')).toHaveCount(1);
});

test('compare view and framing tool', async ({ page }) => {
  await loadSample(page);
  await page.getByRole('radio', { name: 'Before / after' }).click();
  await expect(page.getByText('Original', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Edit' }).click();
  await page.getByRole('radio', { name: 'Frame' }).click();
  await expect(page.locator('.frame')).toBeVisible();
  await page.getByRole('button', { name: 'Rotate 90 degrees' }).click();
  await expect(page.locator('.frame')).toBeVisible();
});

test('layout fits the screen without horizontal scroll', async ({ page }) => {
  await loadSample(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  if (process.env.SCREENSHOTS) {
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}-top.png` });
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}-full.png`, fullPage: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: /^Language/ }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}-language-menu.png` });
  }
});

test('mobile shows a sticky download bar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await loadSample(page);
  const bar = page.locator('.mobile-bar');
  await expect(bar).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), bar.getByRole('button', { name: 'Download PDF' }).click()]);
  expect(download.suggestedFilename()).toBe('dni-protected.pdf');
});

test.describe('countries', () => {
  const picker = (page: Page, doc: 1 | 2 = 1) => page.getByRole('button', { name: new RegExp(`^Country of document ${doc}:`) });
  const searchBox = (page: Page) => page.getByRole('combobox', { name: 'Search country or document' });
  const options = (page: Page) => page.getByRole('listbox').getByRole('option');

  async function chooseCountry(page: Page, doc: 1 | 2, country: string) {
    await picker(page, doc).click();
    await page.getByRole('option', { name: new RegExp(`^${country},`) }).click();
    await expect(page.getByRole('button', { name: new RegExp(`^Country of document ${doc}: ${country}`) })).toBeVisible();
  }

  async function screenshotPicker(page: Page, name: string) {
    if (!process.env.SCREENSHOTS) return;
    const project = test.info().project.name;
    // Put the picker near the top of the screen, below the sticky header.
    await picker(page).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' }));
    // No transitions, so switching the color scheme shows its final colors at once.
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.screenshot({ path: `test-results/screens/${project}-${name}-${scheme}.png` });
    }
    await page.emulateMedia({ colorScheme: null });
  }

  test('defaults to the Spanish DNI', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Country of document 1: Spain/ })).toBeVisible();
    await expect(picker(page)).toContainText('Spain');
    await expect(picker(page)).toContainText('DNI (2021 model)');
    await expect(page.getByRole('checkbox', { name: /Card serial number/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /2D-Doc code/ })).toHaveCount(0);
  });

  test('French ID: own fields, sample, protection level and file names', async ({ page }) => {
    await chooseCountry(page, 1, 'France');
    await expect(page.getByRole('checkbox', { name: /2D-Doc code/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Height/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Parents/ })).toHaveCount(0);

    await loadSampleAs(page, 'CNI');
    await expect(page.getByText(/You have covered 8 of 8 recommended details/)).toBeVisible();
    await expect(page.locator('.overlay .zone')).not.toHaveCount(0);

    const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).first().click()]);
    expect(pdf.suggestedFilename()).toBe('cni-protected.pdf');
    const [jpg] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG of this side' }).click()]);
    expect(jpg.suggestedFilename()).toBe('cni-protected-cni1-front.jpg');
  });

  test('switching country moves the automatic zones and keeps drawn ones', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse drawing');
    await loadSample(page);
    await page.getByRole('radio', { name: 'Draw' }).click();
    const box = (await page.getByRole('application').boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.55, { steps: 4 });
    await page.mouse.up();
    await expect(page.locator('.zone.custom')).toHaveCount(1);

    await chooseCountry(page, 1, 'France');
    await expect(page.getByRole('button', { name: /CNI 1 · Front: loaded/ })).toBeVisible();
    await expect(page.locator('.zone.custom')).toHaveCount(1);
    await expect(page.getByRole('status')).toContainText('Document 1: zones placed for National identity card (since 2021).');
  });

  test('documents from different countries use neutral field names', async ({ page }) => {
    await page.getByRole('switch', { name: 'Add a second document' }).check({ force: true });
    await expect(page.getByRole('button', { name: /^Country of document 2: Spain/ })).toBeVisible();
    await chooseCountry(page, 2, 'France');
    await expect(page.getByRole('checkbox', { name: /^Document number/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /2D-Doc code/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Parents/ })).toBeVisible();
    await loadSample(page);
    await expect(page.getByText(/You have covered 9 of 9 recommended details/)).toBeVisible();
  });

  test('opening the picker focuses the search box and highlights the selection', async ({ page }) => {
    await picker(page).click();
    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(picker(page)).toHaveAttribute('aria-expanded', 'true');
    const listbox = page.getByRole('listbox', { name: 'Country of document 1' });
    await expect(listbox.getByRole('group', { name: 'France' })).toBeVisible();
    await expect(listbox.getByRole('group', { name: 'Italy' })).toBeVisible();
    await expect(listbox.getByRole('group', { name: 'Spain' })).toBeVisible();
    await expect(listbox.getByRole('group', { name: 'United Kingdom' }).getByRole('option')).toHaveCount(2);
    await expect(listbox.getByRole('group', { name: 'United States' })).toBeVisible();
    // The custom document is listed last.
    await expect(listbox.getByRole('group').last()).toHaveAccessibleName('Custom');
    await expect(options(page)).toHaveCount(7);

    const spain = listbox.getByRole('group', { name: 'Spain' }).getByRole('option');
    await expect(spain).toHaveAccessibleName('Spain, DNI (2021 model), 2021–present, current');
    await expect(spain).toHaveAttribute('aria-selected', 'true');
    await expect(spain).toContainText('Current');
    await expect(searchBox(page)).toHaveAttribute('aria-activedescendant', (await spain.getAttribute('id'))!);
    await expect(page.getByText('More countries coming soon')).toBeVisible();
  });

  test('typing filters by country name', async ({ page }) => {
    await picker(page).click();
    await searchBox(page).fill('fran');
    await expect(page.getByRole('group', { name: 'France' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Spain' })).toHaveCount(0);
    await expect(options(page)).toHaveCount(1);
    await expect(options(page)).toContainText('National identity card (since 2021)');
    await expect(options(page)).toContainText('2021–present');
    await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(searchBox(page)).toHaveValue('');
    await expect(searchBox(page)).toBeFocused();
    await expect(options(page)).toHaveCount(7);
  });

  test('finds documents by acronym and by name in other languages while in English', async ({ page }) => {
    await picker(page).click();
    await searchBox(page).fill('cni');
    await expect(options(page)).toHaveCount(1);
    await expect(page.getByRole('option', { name: /^France, National identity card/ })).toBeVisible();
    await searchBox(page).fill('espagne');
    await expect(options(page)).toHaveCount(1);
    await expect(page.getByRole('group', { name: 'Spain' })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Spain, DNI/ })).toBeVisible();
    await searchBox(page).fill('ESPAÑA dni');
    await expect(options(page)).toHaveCount(1);
  });

  test('shows an empty state and keeps the coming soon line', async ({ page }) => {
    await picker(page).click();
    await searchBox(page).fill('narnia');
    // The visible message (screen readers also get it through the live region).
    const empty = page.locator('.popover .empty');
    await expect(empty).toContainText('No country or document matches “narnia”');
    await expect(page.getByText('More countries coming soon')).toBeVisible();
    // Instead of a dead end, the custom document is offered and highlighted.
    await expect(empty).toContainText('Not in the list? Use a custom document and draw the zones yourself.');
    await expect(options(page)).toHaveCount(1);
    await expect(options(page)).toHaveAccessibleName(/^Custom,/);
    await page.keyboard.press('Enter');
    await expect(picker(page)).toHaveAccessibleName(/^Country of document 1: Custom/);
  });

  test('keyboard: type, ArrowDown and Enter pick a document', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow');
    const trigger = picker(page);
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(searchBox(page)).toBeFocused();
    await page.keyboard.type('fran');
    await page.keyboard.press('ArrowDown');
    await expect(searchBox(page)).toHaveAttribute('aria-activedescendant', (await options(page).getAttribute('id'))!);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toHaveAccessibleName(/^Country of document 1: France, National identity card/);
    await expect(trigger).toContainText('France');
    await expect(trigger).toBeFocused();
    await expect(page.getByRole('checkbox', { name: /2D-Doc code/ })).toBeVisible();
  });

  test('keyboard: arrows wrap and skip the country headers', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow');
    const trigger = picker(page);
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(searchBox(page)).toBeFocused();
    // Options in English order: France, Italy, Spain (selected), United Kingdom (GB, NI), United States.
    const [france, italy, spain, gb, custom] = await Promise.all([
      page.getByRole('option', { name: /^France/ }).getAttribute('id'),
      page.getByRole('option', { name: /^Italy/ }).getAttribute('id'),
      page.getByRole('option', { name: /^Spain/ }).getAttribute('id'),
      page.getByRole('option', { name: /^United Kingdom, Driving licence \(Great Britain/ }).getAttribute('id'),
      page.getByRole('option', { name: /^Custom,/ }).getAttribute('id'),
    ]);
    const expectActive = (id: string | null) => expect(searchBox(page)).toHaveAttribute('aria-activedescendant', id!);
    await expectActive(spain);
    await page.keyboard.press('ArrowDown');
    await expectActive(gb);
    await page.keyboard.press('ArrowUp');
    await expectActive(spain);
    await page.keyboard.press('ArrowUp');
    await expectActive(italy);
    await page.keyboard.press('End');
    await expectActive(custom);
    await page.keyboard.press('ArrowDown');
    await expectActive(france);
    await page.keyboard.press('ArrowUp');
    await expectActive(custom);
    await page.keyboard.press('Home');
    await expectActive(france);
    await page.keyboard.press('ArrowDown');
    await expectActive(italy);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toHaveAccessibleName(/Italy/);
  });

  test('Escape clears the search first, then closes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow');
    const trigger = picker(page);
    await trigger.click();
    await page.keyboard.type('fran');
    await expect(options(page)).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(searchBox(page)).toHaveValue('');
    await expect(options(page)).toHaveCount(7);
    await expect(searchBox(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAccessibleName(/Spain/);

    await page.keyboard.press('ArrowUp');
    await expect(searchBox(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await heading(page).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('the open picker fits the screen', async ({ page }) => {
    await picker(page).click();
    await searchBox(page).fill('ident');
    await expect(options(page)).toHaveCount(3);
    const width = page.viewportSize()!.width;
    for (const box of [await searchBox(page).boundingBox(), await page.getByRole('listbox').boundingBox()]) {
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await screenshotPicker(page, 'country-picker');
    await searchBox(page).fill('narnia');
    await screenshotPicker(page, 'country-picker-empty');
  });
});

test.describe('languages', () => {
  const trigger = (page: Page) => page.getByRole('button', { name: /^(Language|Idioma|Langue|Lingua)/ });

  async function chooseLanguage(page: Page, name: string) {
    await trigger(page).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.getByRole('menuitemradio', { name, exact: true }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
  }

  test('switching from the header changes the texts and survives a reload', async ({ page }) => {
    await expect(trigger(page)).toHaveAccessibleName('Language: English');
    await chooseLanguage(page, 'Español');
    await expect(heading(page)).toHaveText('Protege tu DNI antes de enviarlo');
    await page.getByRole('button', { name: 'Probar con un ejemplo' }).click();
    await expect(page.getByRole('status')).toContainText('Ejemplo de DNI (España) cargado en las dos caras.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveTitle('Sequrid · Protege tu DNI');

    await page.reload();
    await expect(heading(page)).toHaveText('Protege tu DNI antes de enviarlo');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(trigger(page)).toHaveAccessibleName('Idioma: Español');

    await chooseLanguage(page, 'Français');
    await expect(heading(page)).toHaveText('Protégez votre carte d’identité avant de l’envoyer');
    await expect(page.getByRole('button', { name: 'Essayer avec un exemple' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(heading(page)).toHaveText('Protégez votre carte d’identité avant de l’envoyer');
  });

  test('switching updates the loaded document, watermark, status and file names', async ({ page }) => {
    await loadSample(page);
    await expect(page.getByRole('status')).toContainText('Sample DNI (Spain) loaded on both sides.');
    await expect(page.getByLabel('Watermark text')).toHaveText(/^LIMITED-USE COPY · \d{2}\/\d{2}\/\d{4}$/);

    await chooseLanguage(page, 'Français');
    await expect(page.getByRole('button', { name: /^DNI 1 · Recto\s:\schargée/ })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Exemple de DNI (Espagne) chargé sur les deux faces.');
    await expect(page.getByLabel('Texte du filigrane')).toHaveText(/^COPIE À USAGE LIMITÉ · \d{2}\/\d{2}\/\d{4}$/);
    await expect(page.getByRole('checkbox', { name: 'Code CAN' })).toBeChecked();
    await expect(page.getByText(/Protection élevée\./)).toBeVisible();
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Télécharger le PDF' }).first().click()]);
    expect(pdf.suggestedFilename()).toBe('dni-protege.pdf');
    const [jpg] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG de cette face' }).click()]);
    expect(jpg.suggestedFilename()).toBe('dni-protege-dni1-recto.jpg');

    await chooseLanguage(page, 'Español');
    await expect(page.getByText(/Has tapado 7 de 7 datos recomendados/)).toBeVisible();
    const [es] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG de esta cara' }).click()]);
    expect(es.suggestedFilename()).toBe('dni-protegido-dni1-anverso.jpg');
  });

  test('zone tags on the canvas follow the language', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow');
    await loadSample(page);
    await page.getByRole('application').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('.zone.selected .tag')).toHaveText('Card serial number');
    await chooseLanguage(page, 'Español');
    await expect(page.locator('.zone.selected .tag')).toHaveText('Número de soporte');
  });

  test('language menu works with the keyboard and closes outside', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard flow');
    const button = trigger(page);
    await button.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menu')).toBeVisible();
    // "Automatic" comes first and is selected: nothing has been chosen yet.
    const auto = page.getByRole('menuitemradio', { name: /^Automatic/ });
    await expect(auto).toBeFocused();
    await expect(auto).toHaveAttribute('aria-checked', 'true');
    await expect(auto).toContainText('Browser language: English');
    // Native names only: the decorative language code is hidden from screen readers.
    for (const name of ['English', 'Español', 'Français', 'Italiano']) {
      await expect(page.getByRole('menuitemradio', { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('menuitemradio', { name: 'English', exact: true })).toHaveAttribute('aria-checked', 'false');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitemradio', { name: 'Español' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(button).toHaveAccessibleName('Idioma: Español');
    await expect(button).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitemradio', { name: 'Italiano' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(button).toBeFocused();

    await button.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await heading(page).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test.describe('automatic language', () => {
  const trigger = (page: Page) => page.getByRole('button', { name: /^(Language|Idioma|Langue|Lingua)/ });
  const saved = (page: Page) => page.evaluate(() => localStorage.getItem('sequrid-language'));

  async function choose(page: Page, name: string | RegExp) {
    await trigger(page).click();
    await page.getByRole('menuitemradio', typeof name === 'string' ? { name, exact: true } : { name }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
  }

  test('picking the browser language keeps following the browser', async ({ page }) => {
    await choose(page, 'English');
    expect(await saved(page)).toBeNull();
    await trigger(page).click();
    await expect(page.getByRole('menuitemradio', { name: /^Automatic/ })).toHaveAttribute('aria-checked', 'true');
  });

  test('another language is remembered until you go back to Automatic', async ({ page }) => {
    await choose(page, 'Español');
    expect(await saved(page)).toBe('es');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await choose(page, /^Automático/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await saved(page)).toBeNull();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('a choice saved by 0.3.0 is dropped so the browser language wins again', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('sequrid-lang', 'fr');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(heading(page)).toHaveText('Protect your ID card before sending it');
    expect(await page.evaluate(() => localStorage.getItem('sequrid-lang'))).toBeNull();
  });
});

test.describe('Italian browser', () => {
  test.use({ locale: 'it-IT' });

  test('starts in Italian and offers the Italian CIE', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await expect(heading(page)).not.toHaveText('Protect your ID card before sending it');
    await expect(page.getByRole('button', { name: /^Lingua/ })).toHaveAccessibleName(/Italiano$/);
  });
});

test.describe('French browser', () => {
  test.use({ locale: 'fr-FR' });

  test('starts in French', async ({ page }) => {
    await expect(heading(page)).toHaveText('Protégez votre carte d’identité avant de l’envoyer');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle('Sequrid · Protégez votre carte d’identité');
    await expect(page.getByRole('button', { name: /^Langue/ })).toHaveAccessibleName(/^Langue\s:\sFrançais$/);
    await expect(page.getByRole('button', { name: /^Pays du document 1/ })).toContainText('Espagne');
  });
});

test.describe('Italy', () => {
  test('Italian CIE: own fields, sample, protection level and file names', async ({ page }) => {
    await page.getByRole('button', { name: /^Country of document 1:/ }).click();
    await page.getByRole('combobox', { name: 'Search country or document' }).fill('ital');
    await page.getByRole('option', { name: /^Italy,/ }).click();
    await expect(page.getByRole('button', { name: /^Country of document 1: Italy/ })).toBeVisible();

    await expect(page.getByRole('checkbox', { name: /Tax code/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Birth record details/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Place and date of birth/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Issuing municipality/ })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: /2D-Doc/ })).toHaveCount(0);

    await loadSampleAs(page, 'CIE');
    await expect(page.getByRole('status')).toContainText('Sample CIE (Italy)');
    await expect(page.getByText(/You have covered 8 of 8 recommended details/)).toBeVisible();
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).first().click()]);
    expect(pdf.suggestedFilename()).toBe('cie-protected.pdf');
  });
});

test.describe('help lines', () => {
  test('are shown as a table with official contacts', async ({ page }) => {
    const section = page.locator('#help');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Where to get help if someone uses your identity');
    const rows = section.locator('tbody tr');
    await expect(rows).toHaveCount(5);
    await expect(section.getByRole('link', { name: '0300 123 2040' })).toHaveAttribute('href', 'tel:03001232040');
    await expect(section.getByRole('link', { name: /identitytheft\.gov/ })).toHaveAttribute('href', 'https://www.identitytheft.gov/');
    await expect(section.getByRole('link', { name: '017', exact: true })).toHaveAttribute('href', 'tel:017');
    await expect(section.getByRole('link', { name: /17cyber\.gouv\.fr/ })).toHaveAttribute('href', 'https://www.17cyber.gouv.fr/');
    await expect(section.getByRole('link', { name: /commissariatodips\.it/ })).toHaveAttribute('target', '_blank');
    // The country of the document in use comes first.
    await expect(rows.first()).toContainText('Spain');
  });

  test('put the countries in use first and follow the language', async ({ page }) => {
    await page.getByRole('button', { name: /^Country of document 1:/ }).click();
    await page.getByRole('option', { name: /^Italy,/ }).click();
    const rows = page.locator('#help tbody tr');
    await expect(rows.first()).toContainText('Italy');
    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: 'Español', exact: true }).click();
    await expect(page.locator('#help h2')).toHaveText('Dónde pedir ayuda si alguien usa tu identidad');
    await expect(rows.first()).toContainText('Italia');
  });
});

test.describe('United Kingdom and United States', () => {
  const pick = async (page: Page, query: string, option: RegExp) => {
    await page.getByRole('button', { name: /^Country of document 1:/ }).click();
    await page.getByRole('combobox', { name: 'Search country or document' }).fill(query);
    await page.getByRole('option', { name: option }).click();
  };

  test('UK driving licence: Northern Ireland model, fields, sample and file names', async ({ page }) => {
    await pick(page, 'northern ireland', /^United Kingdom, Driving licence \(Northern Ireland/);
    await expect(page.getByRole('button', { name: /^Country of document 1: United Kingdom, Driving licence \(Northern Ireland/ })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Restriction codes \(12\)/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Driver number \(5\)/ })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: /Categories and their dates/ })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: /MRZ/ })).toHaveCount(0);

    await loadSampleAs(page, 'DL');
    await expect(page.getByText(/You have covered 4 of 4 recommended details/)).toBeVisible();
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).first().click()]);
    expect(pdf.suggestedFilename()).toBe('dl-protected.pdf');
    await expect(page.locator('#help tbody tr').first()).toContainText('United Kingdom');
  });

  test('US passport card: fields, sample and file names', async ({ page }) => {
    await pick(page, 'usa', /^United States, Passport card/);
    await expect(page.getByRole('checkbox', { name: /Control numbers and barcode/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /^Signature/ })).toHaveCount(0);

    await loadSampleAs(page, 'Passport Card');
    await expect(page.getByText(/You have covered 4 of 4 recommended details/)).toBeVisible();
    const [jpg] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JPG of this side' }).click()]);
    expect(jpg.suggestedFilename()).toBe('passport-card-protected-passport-card1-front.jpg');
  });
});

test.describe('custom document', () => {
  test('has no predefined fields, starts in Draw mode and judges the drawn zones', async ({ page, isMobile }) => {
    await page.getByRole('button', { name: /^Country of document 1:/ }).click();
    await page.getByRole('combobox', { name: 'Search country or document' }).fill('custom');
    await page.getByRole('option', { name: /^Custom,/ }).click();
    await expect(page.getByRole('status')).toContainText('Document 1: custom document.');
    await expect(page.getByText('This document has no predefined fields.', { exact: false })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /CAN/ })).toHaveCount(0);

    await loadSampleAs(page, 'ID');
    await expect(page.locator('.overlay .zone')).toHaveCount(0);
    await expect(page.getByRole('radio', { name: 'Draw' })).toBeChecked();
    await expect(page.getByText(/Nothing is covered yet/)).toBeVisible();

    if (!isMobile) {
      const box = (await page.getByRole('application').boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.45, { steps: 4 });
      await page.mouse.up();
      await expect(page.getByText(/1 zone drawn\./)).toBeVisible();
    }
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).first().click()]);
    expect(pdf.suggestedFilename()).toBe('id-protected.pdf');
  });
});

async function loadSampleAs(page: Page, short: string) {
  await page.getByRole('button', { name: 'Try with a sample' }).click();
  await expect(page.getByRole('button', { name: new RegExp(`${short} 1 · Front: loaded`) })).toBeVisible();
  await expect(page.getByRole('button', { name: new RegExp(`${short} 1 · Back: loaded`) })).toBeVisible();
}
