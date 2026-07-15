import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { collectIconManifest, collectBgManifest, renderManifestTs } from './generate-img-manifests.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpImgDir() {
  const root = mkdtempSync(join(tmpdir(), 'canvas-img-test-'));
  const dirs = ['icons/unicons', 'icons/marker', 'icons/iot', 'bg'];
  for (const d of dirs) {
    mkdirSync(join(root, d), { recursive: true });
  }
  return root;
}

function touch(dir, ...files) {
  for (const f of files) {
    writeFileSync(join(dir, f), '');
  }
}

// ---------------------------------------------------------------------------
// collectIconManifest
// ---------------------------------------------------------------------------

describe('collectIconManifest', () => {
  it('groups svg files by subdirectory under icons/', () => {
    const tmp = makeTmpImgDir();
    try {
      touch(join(tmp, 'icons/unicons'), 'arrow-right.svg', 'cloud.svg');
      touch(join(tmp, 'icons/marker'), 'circle.svg');
      touch(join(tmp, 'icons/iot'), 'drone.svg');

      const result = collectIconManifest(tmp);

      assert.deepEqual(Object.keys(result).sort(), ['img/icons/iot', 'img/icons/marker', 'img/icons/unicons']);
      assert.deepEqual(result['img/icons/unicons'], { 'arrow-right.svg': true, 'cloud.svg': true });
      assert.deepEqual(result['img/icons/marker'], { 'circle.svg': true });
      assert.deepEqual(result['img/icons/iot'], { 'drone.svg': true });
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('ignores non-svg files', () => {
    const tmp = makeTmpImgDir();
    try {
      touch(join(tmp, 'icons/unicons'), 'arrow.svg', 'LICENSE_APACHE2', 'NOTICE.txt');

      const result = collectIconManifest(tmp);

      assert.deepEqual(result['img/icons/unicons'], { 'arrow.svg': true });
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('returns empty object when no svg files exist', () => {
    const tmp = makeTmpImgDir();
    try {
      const result = collectIconManifest(tmp);
      assert.deepEqual(result, {});
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});

// ---------------------------------------------------------------------------
// collectBgManifest
// ---------------------------------------------------------------------------

describe('collectBgManifest', () => {
  it('collects png files under bg/ into a single img/bg key', () => {
    const tmp = makeTmpImgDir();
    try {
      touch(join(tmp, 'bg'), 'p0.png', 'p1.png', 'p2.png');

      const result = collectBgManifest(tmp);

      assert.deepEqual(Object.keys(result), ['img/bg']);
      assert.deepEqual(result['img/bg'], { 'p0.png': true, 'p1.png': true, 'p2.png': true });
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('ignores non-png files', () => {
    const tmp = makeTmpImgDir();
    try {
      touch(join(tmp, 'bg'), 'p0.png', 'p0.jpg', 'README.md');

      const result = collectBgManifest(tmp);

      assert.deepEqual(result['img/bg'], { 'p0.png': true });
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('returns empty img/bg object when no png files exist', () => {
    const tmp = makeTmpImgDir();
    try {
      const result = collectBgManifest(tmp);
      assert.deepEqual(result, { 'img/bg': {} });
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});

// ---------------------------------------------------------------------------
// renderManifestTs
// ---------------------------------------------------------------------------

describe('renderManifestTs', () => {
  it('includes the auto-generated header warning', () => {
    const result = renderManifestTs('MY_MANIFEST', {});
    assert.ok(result.includes('DO NOT EDIT'));
    assert.ok(result.includes('npm run generate-img-manifests'));
  });

  it('exports the correct variable name', () => {
    const result = renderManifestTs('ICON_MANIFEST', {});
    assert.ok(result.includes('export const ICON_MANIFEST'));
  });

  it('renders directory keys and filenames correctly', () => {
    const data = {
      'img/icons/unicons': { 'arrow.svg': true, 'cloud.svg': true },
    };
    const result = renderManifestTs('ICON_MANIFEST', data);
    assert.ok(result.includes("'img/icons/unicons'"));
    assert.ok(result.includes("'arrow.svg': true"));
    assert.ok(result.includes("'cloud.svg': true"));
  });

  it('sorts filenames alphabetically', () => {
    const data = {
      'img/icons/unicons': { 'zebra.svg': true, 'apple.svg': true, 'mango.svg': true },
    };
    const result = renderManifestTs('ICON_MANIFEST', data);
    const appleIdx = result.indexOf("'apple.svg'");
    const mangoIdx = result.indexOf("'mango.svg'");
    const zebraIdx = result.indexOf("'zebra.svg'");
    assert.ok(appleIdx < mangoIdx && mangoIdx < zebraIdx, 'filenames should be sorted alphabetically');
  });

  it('includes the correct TypeScript type annotation', () => {
    const result = renderManifestTs('BG_MANIFEST', {});
    assert.ok(result.includes('Record<string, Record<string, true>>'));
  });
});
