import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_IMG = join(ROOT, 'src', 'img');

const HEADER = `\
// ⚠️  DO NOT EDIT — this file is auto-generated.
// Run \`npm run generate-img-manifests\` to regenerate from bundled assets in src/img/.
// Manual edits will be overwritten on the next run.
`;

/** @param {string} srcImgDir absolute path to src/img */
export function collectIconManifest(srcImgDir) {
  const files = globSync('icons/**/*.svg', { cwd: srcImgDir, posix: true });
  /** @type {Record<string, Record<string, true>>} */
  const manifest = {};
  for (const file of files) {
    const parts = file.split('/');
    const filename = parts.at(-1);
    const dir = 'img/' + parts.slice(0, -1).join('/');
    manifest[dir] ??= {};
    manifest[dir][filename] = true;
  }
  return manifest;
}

/** @param {string} srcImgDir absolute path to src/img */
export function collectBgManifest(srcImgDir) {
  const files = globSync('bg/*.png', { cwd: srcImgDir, posix: true });
  /** @type {Record<string, Record<string, true>>} */
  const manifest = { 'img/bg': {} };
  for (const file of files) {
    manifest['img/bg'][file.split('/').at(-1)] = true;
  }
  return manifest;
}

/**
 * @param {string} exportName
 * @param {Record<string, Record<string, true>>} data
 * @returns {string}
 */
export function renderManifestTs(exportName, data) {
  const entries = Object.entries(data)
    .map(([dir, files]) => {
      const fileEntries = Object.keys(files)
        .sort()
        .map((f) => `    '${f}': true,`)
        .join('\n');
      return `  '${dir}': {\n${fileEntries}\n  },`;
    })
    .join('\n');
  return `${HEADER}\nexport const ${exportName}: Record<string, Record<string, true>> = {\n${entries}\n};\n`;
}

/** @param {string} filePath @param {string} content */
export function writeManifest(filePath, content) {
  writeFileSync(filePath, content, 'utf8');
}

function main() {
  const iconData = collectIconManifest(SRC_IMG);
  const iconTs = renderManifestTs('ICON_MANIFEST', iconData);
  writeManifest(join(SRC_IMG, 'icons', 'manifest.ts'), iconTs);
  console.log('✔ src/img/icons/manifest.ts generated');

  const bgData = collectBgManifest(SRC_IMG);
  const bgTs = renderManifestTs('BG_MANIFEST', bgData);
  writeManifest(join(SRC_IMG, 'bg', 'manifest.ts'), bgTs);
  console.log('✔ src/img/bg/manifest.ts generated');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
