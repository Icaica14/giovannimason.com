// One-off: compress the existing locandine PNGs (1–3.5 MB each) into
// web-optimized WebP in public/uploads, so CMS-served posters stay light
// (public/ assets bypass Astro's image optimizer). New uploads via the CMS
// should already be reasonably sized; see docs/area-riservata.md.
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const SRC = 'src/assets/img/locandine';
const OUT = 'public/uploads';
const MAX_W = 1000; // posters render ≤720px; 1000px covers retina

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.png$/i.test(f));

for (const f of files) {
  const name = basename(f, extname(f)) + '.webp';
  const info = await sharp(join(SRC, f))
    .resize({ width: MAX_W, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(OUT, name));
  console.log(`${f} -> ${name}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`Done: ${files.length} posters compressed into ${OUT}`);
