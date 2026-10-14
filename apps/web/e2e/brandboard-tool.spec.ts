import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

interface CropConfig {
  items: {
    id: string;
    crop: { width: number; height: number };
    outputs: { path: string; scale?: number; width?: number; height?: number }[];
  }[];
}

test('development brandboard tool previews crops and writes configured PNG sizes', async ({
  page,
}) => {
  await page.goto('/desarrollo/brandboard');

  await expect(
    page.getByRole('heading', { name: 'Recortar elementos de la brandboard' }),
  ).toBeVisible();
  await expect(page.locator('.crop-box')).toHaveCount(12);
  const image = page.getByRole('img', { name: /Brandboard completa/ });
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBe(1536);
  await expect(page.locator('.board-scroll')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.crop-box.selected')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.locator('.brand-logo')).toHaveAttribute(
    'src',
    '/assets/brand/logo-horizontal-color.png',
  );
  await page.getByLabel('Color del fondo').fill('#e4e9ef');
  await expect(page.locator('.board-scroll')).toHaveCSS('background-color', 'rgb(228, 233, 239)');
  await page.getByLabel('Zoom').fill('1');
  await expect(page.locator('.board-canvas')).toHaveCSS('width', '1536px');

  await page.getByRole('button', { name: 'Extraer todos los elementos' }).click();
  await expect(page.getByRole('status')).toContainText('Se han generado');

  const config = JSON.parse(
    await readFile(path.resolve('src/app/dev/brandboard/brandboard-crops.json'), 'utf8'),
  ) as CropConfig;
  const outputs = config.items.flatMap((item) =>
    item.outputs.map((output) => ({ crop: item.crop, output })),
  );
  expect(config.items.find((item) => item.id === 'favicon')?.crop).toEqual(
    config.items.find((item) => item.id === 'app-icon-light')?.crop,
  );
  for (const { crop, output } of outputs) {
    const ratio = crop.width / crop.height;
    const width =
      output.scale !== undefined
        ? Math.max(1, Math.round(crop.width * output.scale))
        : (output.width ?? Math.round((output.height ?? crop.height) * ratio));
    const height =
      output.scale !== undefined
        ? Math.max(1, Math.round(crop.height * output.scale))
        : (output.height ?? Math.round((output.width ?? crop.width) / ratio));
    const file = await readFile(path.resolve('public', output.path));
    expect(file.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(file.readUInt32BE(16)).toBe(width);
    expect(file.readUInt32BE(20)).toBe(height);
  }
  const symbolOutput = outputs.find(
    ({ output }) => output.path === 'assets/brand/symbol-color.png',
  );
  expect(symbolOutput).toBeDefined();
  const symbolFile = await readFile(path.resolve('public', symbolOutput!.output.path));
  expect(symbolFile.readUInt32BE(16)).toBe(512);
  expect(symbolFile.readUInt32BE(20)).toBe(664);

  const rejectedPath = await page.request.post('/__brandboard/extract', {
    data: { files: [{ path: '../../package.json', base64: 'iVBORw0KGgo=' }] },
  });
  expect(rejectedPath.status()).toBe(400);
});
