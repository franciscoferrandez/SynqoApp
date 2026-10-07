import { readFileSync, writeFileSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(path, 'utf8');
const json = (path) => JSON.parse(read(path));
const ownLicense = join(root, 'LICENSE');
const mode = process.argv[2];
const noticeName = /^(?:licen[cs]e|copying|notice|copyright(?:notice)?)(?:[._-].*)?$/i;

// Inspect files, not source identifiers such as OpenAPI's Model/License.php.
function notices(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && noticeName.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function apiNotices(directory) {
  const lock = json(join(directory, 'composer.lock'));
  const installed = json(join(directory, 'vendor/composer/installed.json'));
  const packages = installed.packages ?? installed;
  const byName = new Map(packages.map((item) => [item.name, item]));
  const production = process.argv.includes('--production');
  const locked = [...lock.packages, ...(production ? [] : lock['packages-dev'])];
  if (production && lock['packages-dev'].some((item) => byName.has(item.name))) {
    throw new Error('El staging de producción contiene dependencias de desarrollo.');
  }
  if (packages.some((item) => !locked.some((entry) => entry.name === item.name))) {
    throw new Error('Hay dependencias instaladas fuera del lockfile.');
  }
  const sections = [
    'Avisos de terceros de API. El aviso propio SYNQO-LICENSE.txt no se aplica a estos componentes.',
    `Symfony Skeleton — MIT\n${read(join(directory, 'LICENSE'))}`,
    `Symfony Flex recipes — MIT\n${read(join(root, 'doc/legal/third_party/symfony-recipes-LICENSE.txt'))}`,
    `Composer autoloader — MIT\n${read(join(directory, 'vendor/composer/LICENSE'))}`,
  ];
  for (const pkg of locked.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const actual = byName.get(pkg.name);
    if (!actual || actual.version !== pkg.version) {
      throw new Error(`Dependencia ausente o distinta del lockfile: ${pkg.name}`);
    }
    const packageDir = join(directory, 'vendor', pkg.name);
    const files = notices(packageDir);
    let texts = files.map((file) => `${file}\n${read(join(packageDir, file))}`);
    // The JSON-LD split 5.0.2 omits LICENSE although its sources refer to it.
    // Preserve the parent project's notice only for the audited source revision.
    if (pkg.name === 'api-platform/jsonld' && files.length === 0
      && pkg.source?.reference === '8c85e35288931b169b524f980eb76bc34a646d16') {
      texts = [read(join(root, 'doc/legal/third_party/api-platform-jsonld-LICENSE.txt'))];
    }
    if (texts.length === 0 || !pkg.license?.length) {
      throw new Error(`Revisar avisos/licencia de ${pkg.name}; no se permite omitirlos.`);
    }
    sections.push(`Package: ${pkg.name}\nVersion: ${pkg.version}\nLicense: ${pkg.license.join(' OR ')}\n${texts.join('\n')}`);
  }
  writeFileSync(join(directory, 'THIRD_PARTY_NOTICES.txt'), `${sections.join('\n\n--------------------------------------------------------------------------------\n\n')}\n`);
  copyFileSync(ownLicense, join(directory, 'SYNQO-LICENSE.txt'));
  console.log(`API: ${locked.length} paquetes; avisos en ${directory}`);
}

function webNotices(directory) {
  const browser = join(directory, 'browser');
  const aggregate = join(directory, '3rdpartylicenses.txt');
  if (!read(aggregate).includes('Package:')) {
    throw new Error('El build WEB no generó avisos de dependencias. Usa el build de producción.');
  }
  const fontLicense = join(browser, 'fonts/LICENSE.txt');
  if (read(fontLicense) !== read(join(root, 'apps/web/public/fonts/LICENSE.txt'))) {
    throw new Error('Falta o ha cambiado el aviso de Inter en el sitio WEB.');
  }
  const lock = json(join(root, 'apps/web/package-lock.json'));
  const sections = [];
  for (const [path, pkg] of Object.entries(lock.packages)) {
    // Retain all runtime packages, even if AOT/tree shaking removes their code,
    // and Tailwind's CSS templates which are compiled by a development tool.
    if (!path || (pkg.dev && path !== 'node_modules/tailwindcss')) continue;
    const packageDir = join(root, 'apps/web', path);
    const actual = json(join(packageDir, 'package.json'));
    const files = notices(packageDir);
    if (!files.length || !pkg.license || actual.version !== pkg.version) {
      throw new Error(`Revisar avisos/versión de ${path}; no se permite omitirlos.`);
    }
    sections.push(`Package: ${actual.name}\nVersion: ${pkg.version}\nLicense: ${pkg.license}\n${files.map((file) => `${file}\n${read(join(packageDir, file))}`).join('\n')}`);
  }
  // Angular emits the aggregate beside browser/, while browser/ is served alone.
  copyFileSync(aggregate, join(browser, '3rdpartylicenses.txt'));
  copyFileSync(ownLicense, join(browser, 'SYNQO-LICENSE.txt'));
  copyFileSync(join(root, 'doc/legal/third_party/angular-schematics-LICENSE.txt'), join(browser, 'ANGULAR-TEMPLATES-LICENSE.txt'));
  writeFileSync(join(browser, 'THIRD_PARTY_NOTICES.txt'), `${sections.join('\n\n--------------------------------------------------------------------------------\n\n')}\n`);
  console.log(`WEB: avisos propios, dependencias e Inter conservados en ${browser}`);
}

try {
  if (!existsSync(ownLicense)) throw new Error('Falta el aviso propio LICENSE.');
  if (mode === 'api') apiNotices(resolve(process.argv[3] ?? join(root, 'apps/api')));
  else if (mode === 'web') webNotices(resolve(process.argv[3] ?? join(root, 'apps/web/dist/web')));
  else throw new Error('Uso: node scripts/distribution-notices.mjs api [directorio-api] [--production] | web [dist/web]');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
