import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const MEDIA_PACK = process.env.ONIT_MEDIA_PACK ?? '/Users/sem/Downloads/ONIT-MediaPack';
const OVERVIEW_DIRS = [
  path.join(MEDIA_PACK, 'Products_Overview/Dunkler_Hintergrund_Komprimiert'),
  path.join(MEDIA_PACK, 'Products_Overview/Heller_Hintergrund_Komprimiert'),
];
const RAPPORT_DIR = path.join(MEDIA_PACK, 'ONIT-Rapport_300dpi');
const OUT_JSON = path.join(projectRoot, 'src/data/onit-materials.json');
const OUT_PUBLIC = path.join(projectRoot, 'public/materials/onit');

const catalog = [
  { family: 'single-color', name: 'Cherry 2.0', code: 'SC 356' },
  { family: 'single-color', name: 'Grit 2.0', code: 'SC 156' },
  { family: 'single-color', name: 'Cotton 2.0', code: 'SC 060' },
  { family: 'single-color', name: 'Papilo Ivy Lux', code: 'SC 029' },
  { family: 'single-color', name: 'Alga', code: 'S200' },
  { family: 'single-color', name: 'Lion 2.0', code: 'SC 153' },
  { family: 'single-color', name: 'Natural 2.0', code: 'SC 055' },
  { family: 'single-color', name: 'Sheep Lux', code: 'SC 063' },
  { family: 'single-color', name: 'Mesa', code: 'SC 162' },
  { family: 'single-color', name: 'Balm Ice 2.0', code: 'SC 207' },
  { family: 'single-color', name: 'Truffle', code: 'SC 161' },
  { family: 'single-color', name: 'Balm Heaven', code: 'SC 195' },
  { family: 'single-color', name: 'Sunflower', code: 'S 146' },
  { family: 'single-color', name: 'Basswood', code: 'S 212' },
  { family: 'single-color', name: 'Ivy 2.0', code: 'SC 255' },
  { family: 'single-color', name: 'Sand 2.0', code: 'SC 155' },
  { family: 'single-color', name: 'Rosette', code: 'SC 165' },
  { family: 'single-color', name: 'Glacier', code: 'SC 301' },
  { family: 'single-color', name: 'Lichen', code: 'SC 257' },
  { family: 'single-color', name: 'Canvas', code: 'SC 167' },
  { family: 'single-color', name: 'Papil Bone Lux', code: 'SC 018' },
  { family: 'single-color', name: 'Tundral', code: 'SC 306' },
  { family: 'single-color', name: 'Papilo Loxo Lux', code: 'SC 020' },
  { family: 'single-color', name: 'Yella', code: 'SC 357' },
  { family: 'single-color', name: 'Mint', code: 'S 214' },
  { family: 'single-color', name: 'Viridell', code: 'SC 217' },
  { family: 'single-color', name: 'Petaline', code: 'SC 361' },
  { family: 'single-color', name: 'Pine', code: 'SC 258' },
  { family: 'single-color', name: 'Chalk 2.0', code: 'SC 152' },
  { family: 'single-color', name: 'Eucalyptus', code: 'S 239' },
  { family: 'single-color', name: 'Balm Rose 2.0', code: 'SC 366' },
  { family: 'single-color', name: 'Quartz', code: 'SC 166' },
  { family: 'single-color', name: 'Dune', code: 'SC 160' },
  { family: 'single-color', name: 'Papilla Sand', code: 'SC 007' },
  { family: 'single-color', name: 'Root', code: 'S145' },
  { family: 'single-color', name: 'Aurivine', code: 'SC 218' },
  { family: 'single-color', name: 'Linen 2.0', code: 'SC 061' },
  { family: 'single-color', name: 'Inuit 2.0', code: 'SC 304' },
  { family: 'single-color', name: 'Galaxy 2.0', code: 'SC 109' },
  { family: 'single-color', name: 'Balm Tornado 2.0', code: 'SC 213' },
  { family: 'single-color', name: 'Azurit 2.0', code: 'SC 215' },
  { family: 'single-color', name: 'Caffora', code: 'SC 159' },
  { family: 'single-color', name: 'Pond 2.0', code: 'SC 253' },
  { family: 'single-color', name: 'Hippo', code: 'S235' },
  { family: 'single-color', name: 'Sprig', code: 'SC 256' },
  { family: 'single-color', name: 'Pure Black', code: 'S140' },
  { family: 'single-color', name: 'Scratch Card', code: 'S210' },
  { family: 'single-color', name: 'Turtle 2.0', code: 'SC 157' },
  { family: 'single-color', name: 'Nymora', code: 'SC 220' },
  { family: 'single-color', name: 'Smoke', code: 'SC 115' },
  { family: 'wood', name: 'Ibis', code: 'W823' },
  { family: 'wood', name: 'Tibos', code: 'WO821' },
  { family: 'wood', name: 'Silva 2.0', code: 'WD 204' },
  { family: 'wood', name: 'Saltu', code: 'W638' },
  { family: 'wood', name: 'Irish Light 2.0', code: 'WD 227' },
  { family: 'wood', name: 'Fagis', code: 'WO811' },
  { family: 'wood', name: 'Fructus', code: 'ZX119' },
  { family: 'wood', name: 'Radiant Rabbit', code: 'ZX132' },
  { family: 'wood', name: 'Old Bench 2.0', code: 'WD 409' },
  { family: 'wood', name: 'Glandis', code: 'ZX216' },
  { family: 'wood', name: 'Alba Medi', code: 'ZX 111' },
  { family: 'wood', name: 'Resina 2.0', code: 'WD 004' },
  { family: 'wood', name: 'Spargo', code: 'WO820' },
  { family: 'wood', name: 'Lignea', code: 'ZX123' },
  { family: 'wood', name: 'Dignus', code: 'W816' },
  { family: 'wood', name: 'Chestnut', code: 'W207' },
  { family: 'wood', name: 'Hazel 2.0', code: 'WD405' },
  { family: 'wood', name: 'Pavus', code: 'SPW16' },
  { family: 'wood', name: 'Pictis Obscura', code: 'PW 110' },
  { family: 'wood', name: 'Honey', code: 'W949' },
  { family: 'stone', name: 'Seris', code: 'ST 168' },
  { family: 'stone', name: 'Luxe Vein', code: 'ST 173' },
  { family: 'stone', name: 'Vellum', code: 'ST 167' },
  { family: 'stone', name: 'Mora', code: 'LE 012' },
  { family: 'stone', name: 'Noma', code: 'LE 011' },
  { family: 'stone', name: 'Dark Nero', code: 'PS 514' },
  { family: 'stone', name: 'Alcino', code: 'ST 172' },
  { family: 'stone', name: 'Onyx 2.0', code: 'ST 155' },
  { family: 'stone', name: 'Riva', code: 'LE 013' },
  { family: 'stone', name: 'Snowpeak', code: 'ST 203' },
  { family: 'stone', name: 'Cream Veil', code: 'ST 253' },
  { family: 'stone', name: 'Fractura Shell 2.0', code: 'ST 251' },
  { family: 'stone', name: 'Soft Chalk', code: 'ST 254' },
  { family: 'stone', name: 'Lumira', code: 'ST 062' },
  { family: 'stone', name: 'Norvia', code: 'ST 061' },
  { family: 'stone', name: 'Middle Cement', code: 'NS 704' },
  { family: 'stone', name: 'Dark Concrete Beton', code: 'NS 403' },
  { family: 'stone', name: 'Fracture White', code: 'PNC 49' },
  { family: 'stone', name: 'Light Cement', code: 'NS 703' },
  { family: 'stone', name: 'Draculos', code: 'ST 504' },
  { family: 'stone', name: 'Darco', code: 'ST 505' },
  { family: 'stone', name: 'Travetine', code: 'NS 806' },
  { family: 'stone', name: 'Stone Veil', code: 'ST 118' },
  { family: 'stone', name: 'Fractura Grit 2.0', code: 'ST 252' },
  { family: 'stone', name: 'Dark Terrazzo', code: 'PM 004' },
  { family: 'stone', name: 'Velora', code: 'ST 166' },
  { family: 'stone', name: 'Litus 2.0', code: 'ST 102' },
  { family: 'stone', name: 'Patina Earth', code: 'NS 602' },
  { family: 'stone', name: 'Patina Moon', code: 'NS 601' },
  { family: 'stone', name: 'Natural Slate', code: 'NS 428' },
  { family: 'stone', name: 'Venetiano', code: 'NS 816' },
  { family: 'stone', name: 'Grey Marble', code: 'PM 006' },
  { family: 'stone', name: 'Bright Concrete Beton', code: 'NS 401' },
  { family: 'stone', name: 'Nero Marquina', code: 'NS 804' },
  { family: 'metal', name: 'Riven', code: 'ME 164' },
  { family: 'metal', name: 'Solis Gold 2.0', code: 'ME 159' },
  { family: 'metal', name: 'Stria', code: 'ME 203' },
  { family: 'metal', name: 'Elara', code: 'ME 006' },
  { family: 'metal', name: 'Solis Copper 2.0', code: 'ME 162' },
  { family: 'metal', name: 'Silva', code: 'ME 304' },
  { family: 'metal', name: 'Solin', code: 'ME 206' },
  { family: 'metal', name: 'Fenix', code: 'ME 301' },
  { family: 'metal', name: 'Velor', code: 'ME 167' },
  { family: 'metal', name: 'Lunor', code: 'ME 163' },
  { family: 'metal', name: 'Corten', code: 'ME 005' },
];

function normalizeCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

function slugify(name, code) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${normalizeCode(code).toLowerCase()}`;
}

/** Supplier code on order docs may differ from ONIT media filenames. */
const FILE_CODE_OVERRIDES = {
  S200: 'SC252',
  S212: 'SC251',
  S214: 'SC203',
  S239: 'SC223',
  S145: 'SC154',
  S235: 'SC104',
  S210: 'SC210',
  W823: 'WD407',
  WO821: 'WD402',
  W638: 'WD638',
  WO811: 'WD302',
  ZX119: 'ZX119',
  ZX132: 'ZX132',
  WD409: 'WD409',
  ZX216: 'WD215',
  ZX111: 'ZX111',
  WO820: 'WD208',
  ZX123: 'ZX123',
  W816: 'W816',
  W207: 'W207',
  W208: 'WD405',
  SPW16: 'WD216',
  PW110: 'PW110',
  W949: 'W949',
};

function nameTokens(name) {
  return name
    .toLowerCase()
    .replace(/2\.0/g, '2-0')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function fileMatchesName(file, name) {
  const normalized = file.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return nameTokens(name).every((token) => normalized.includes(token.replace(/-/g, '')));
}

function findInOverviews(prefix, overviewByDir) {
  for (const { dir, files } of overviewByDir) {
    const overview = files.find((file) => file.toUpperCase().startsWith(`${prefix}-`));
    if (overview) return { file: overview, dir };
  }
  return null;
}

function findMediaFile(codeNorm, name, overviewByDir, rapportFiles) {
  const candidates = [
    codeNorm.toUpperCase(),
    FILE_CODE_OVERRIDES[codeNorm.toUpperCase()],
  ].filter(Boolean);

  for (const prefix of candidates) {
    const fromOverview = findInOverviews(prefix, overviewByDir);
    if (fromOverview) return fromOverview;
    const rapport = rapportFiles.find((file) => file.toUpperCase().startsWith(`${prefix}_`));
    if (rapport) return { file: rapport, dir: RAPPORT_DIR };
  }

  for (const { dir, files } of overviewByDir) {
    const byName = files.find((file) => fileMatchesName(file, name));
    if (byName) return { file: byName, dir };
  }
  const rapportByName = rapportFiles.find((file) => fileMatchesName(file, name));
  if (rapportByName) return { file: rapportByName, dir: RAPPORT_DIR };

  return null;
}

function aiDescription(family, name) {
  switch (family) {
    case 'wood':
      return `kitchen cabinet wrap with realistic ${name} wood grain texture and matte finish, preserve layout and only change cabinet fronts`;
    case 'stone':
      return `kitchen cabinet wrap with realistic ${name} stone surface texture and matte finish, preserve layout and only change cabinet fronts`;
    case 'metal':
      return `kitchen cabinet wrap with realistic ${name} metallic finish, preserve layout and only change cabinet fronts`;
    default:
      return `smooth matte kitchen wrap in ${name} color with uniform finish, preserve layout and only change cabinet fronts`;
  }
}

function familyToType(family) {
  if (family === 'single-color') return 'solid';
  if (family === 'wood') return 'wood';
  if (family === 'stone') return 'stone';
  return 'metal';
}

function familyLabel(family) {
  if (family === 'single-color') return 'Single Color';
  if (family === 'wood') return 'Wood';
  if (family === 'stone') return 'Stone';
  return 'Metal';
}

const overviewByDir = OVERVIEW_DIRS.filter((dir) => fs.existsSync(dir)).map((dir) => ({
  dir,
  files: fs.readdirSync(dir),
}));
const rapportFiles = fs.existsSync(RAPPORT_DIR) ? fs.readdirSync(RAPPORT_DIR) : [];

fs.mkdirSync(OUT_PUBLIC, { recursive: true });

const materials = [];
const missing = [];
const usedDestNames = new Set();

for (const item of catalog) {
  const codeNorm = normalizeCode(item.code);
  const match = findMediaFile(codeNorm, item.name, overviewByDir, rapportFiles);
  let imagePath;

  if (match) {
    const source = path.join(match.dir, match.file);
    const ext = path.extname(source);
    const destName = `${codeNorm}${ext === '.webp' ? '.webp' : '.jpg'}`;
    const destPath = path.join(OUT_PUBLIC, destName);
    fs.copyFileSync(source, destPath);
    usedDestNames.add(destName);
    imagePath = `/materials/onit/${destName}`;
  } else {
    missing.push({ ...item, codeNorm });
  }

  materials.push({
    id: slugify(item.name, item.code),
    name: item.name,
    code: item.code.trim(),
    type: familyToType(item.family),
    family: item.family,
    category: familyLabel(item.family),
    preview: '#E8E8E8',
    ...(imagePath ? { image: imagePath } : {}),
    supplier: 'ONIT',
    sku: codeNorm,
    aiDescription: aiDescription(item.family, item.name),
    active: true,
  });
}

for (const file of fs.readdirSync(OUT_PUBLIC)) {
  if (!usedDestNames.has(file)) {
    fs.unlinkSync(path.join(OUT_PUBLIC, file));
  }
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({ materials, missing }, null, 2));

console.log(`Materials: ${materials.length}, missing images: ${missing.length}`);
if (missing.length) {
  console.log('Missing:', missing.map((m) => `${m.name} (${m.codeNorm})`).join(', '));
}
