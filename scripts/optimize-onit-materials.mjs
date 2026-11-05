import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const OUT_DIR = path.join(projectRoot, 'public/materials/onit');
const SUPPLEMENTAL_DIR = path.join(projectRoot, 'data/supplemental-previews');
const JSON_PATH = path.join(projectRoot, 'src/data/onit-materials.json');

const THUMB_SIZE = 384;
const WEBP_QUALITY = 76;

function extractCodeFromFilename(name) {
  const preview = name.match(/^([A-Z0-9]+)-Preview/i);
  if (preview) return preview[1].toUpperCase();
  const st = name.match(/^(ST\d+)/i);
  if (st) return st[1].toUpperCase();
  return null;
}

async function writeThumb(sourcePath, codeNorm) {
  const dest = path.join(OUT_DIR, `${codeNorm}.webp`);
  await sharp(sourcePath)
    .rotate()
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(dest);
  return dest;
}

async function optimizeExistingWebp(filePath, codeNorm) {
  const dest = path.join(OUT_DIR, `${codeNorm}.webp`);
  const tmp = `${dest}.tmp`;
  await sharp(filePath)
    .rotate()
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(tmp);
  fs.renameSync(tmp, dest);
}

function normalizeCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const imported = [];

  if (fs.existsSync(SUPPLEMENTAL_DIR)) {
    for (const file of fs.readdirSync(SUPPLEMENTAL_DIR)) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      const code = extractCodeFromFilename(file);
      if (!code) {
        console.warn('Skip supplemental (no code):', file);
        continue;
      }
      await writeThumb(path.join(SUPPLEMENTAL_DIR, file), code);
      imported.push(code);
    }
  }

  for (const file of fs.readdirSync(OUT_DIR)) {
    if (!file.endsWith('.webp') || file.endsWith('.tmp')) continue;
    const full = path.join(OUT_DIR, file);
    const stat = fs.statSync(full);
    if (stat.size > 120_000) {
      const codeNorm = file.replace(/\.webp$/i, '');
      await optimizeExistingWebp(full, codeNorm);
    }
  }

  const catalog = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const missing = [];

  for (const material of catalog.materials) {
    const codeNorm = normalizeCode(material.code);
    const imagePath = path.join(OUT_DIR, `${codeNorm}.webp`);
    if (fs.existsSync(imagePath)) {
      material.image = `/materials/onit/${codeNorm}.webp`;
    } else {
      delete material.image;
      missing.push({
        family: material.family,
        name: material.name,
        code: material.code,
        codeNorm,
      });
    }
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify({ materials: catalog.materials, missing }, null, 2));

  const totalSize = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.webp'))
    .reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0);

  console.log(
    `Imported supplemental: ${imported.length}, materials with image: ${catalog.materials.filter((m) => m.image).length}, missing: ${missing.length}, total webp size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`,
  );
  if (missing.length) {
    console.log('Still missing:', missing.map((m) => `${m.name} (${m.codeNorm})`).join(', '));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
