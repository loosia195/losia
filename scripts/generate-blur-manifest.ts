// scripts/generate-blur-manifest.ts
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = path.resolve(process.cwd(), 'public/assets/images/main'); // đổi nếu ảnh ở thư mục khác
const OUT = path.resolve(process.cwd(), 'blur-manifest.json');

(async () => {
  const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  const manifest: Record<string, string> = {};
  for (const file of files) {
    const full = path.join(INPUT_DIR, file);
    const buf = await sharp(full).resize(16).jpeg({ quality: 30 }).toBuffer();
    const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
    manifest[`/assets/images/main/${file}`] = b64; // key = đường dẫn public
  }
  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
  console.log('Wrote', OUT);
})();
