import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'public', 'FrameBuses');
const OUTPUT_ROOT = path.join(ROOT, 'public', 'FrameBusesWebP');

const FRAME_COUNT = 299;
const QUALITY_DESKTOP = 82;
const QUALITY_MOBILE = 75;

const PRESETS = {
  desktop: { width: 1920, height: 1080, quality: QUALITY_DESKTOP },
  mobile:  { width: 960,  height: 540,  quality: QUALITY_MOBILE },
};

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function convertOne(inputPath, outputPath, opts) {
  await sharp(inputPath)
    .resize(opts.width, opts.height, { fit: 'cover', withoutEnlargement: true })
    .webp({
      quality: opts.quality,
      alphaQuality: 0,
      effort: 4,
      smartSubsample: true,
    })
    .toFile(outputPath);
}

async function main() {
  for (const [name, opts] of Object.entries(PRESETS)) {
    const outDir = path.join(OUTPUT_ROOT, name);
    await ensureDir(outDir);
    console.log(`Converting to ${name} (${opts.width}x${opts.height}, q=${opts.quality})...`);

    const concurrency = 6;
    const queue = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const padded = String(i).padStart(3, '0');
      const input = path.join(INPUT_DIR, `frame_${padded}_delay-0.05s.png`);
      const output = path.join(outDir, `frame_${padded}.webp`);

      if (!fs.existsSync(input)) {
        console.warn(`  Missing: ${input}`);
        continue;
      }

      const task = convertOne(input, output, opts).then(() => {
        const size = fs.statSync(output).size;
        console.log(`  [${name}] frame_${padded}.webp  ${(size / 1024).toFixed(0)} KB`);
      });

      queue.push(task);

      if (queue.length >= concurrency) {
        await Promise.all(queue);
        queue.length = 0;
      }
    }

    if (queue.length > 0) {
      await Promise.all(queue);
    }

    // Print summary
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
    const totalSize = files.reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);
    console.log(`  Done: ${files.length} frames, ${(totalSize / 1024 / 1024).toFixed(1)} MB total`);
  }

  // Show comparison
  console.log('\n--- Compression Report ---');
  const originalFiles = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.png'));
  const originalSize = originalFiles.reduce((s, f) => s + fs.statSync(path.join(INPUT_DIR, f)).size, 0);
  console.log(`PNG original: ${originalFiles.length} frames, ${(originalSize / 1024 / 1024).toFixed(1)} MB`);

  for (const [name] of Object.entries(PRESETS)) {
    const outDir = path.join(OUTPUT_ROOT, name);
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
    const size = files.reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0);
    const ratio = ((1 - size / originalSize) * 100).toFixed(1);
    console.log(`WebP ${name}: ${files.length} frames, ${(size / 1024 / 1024).toFixed(1)} MB (${ratio}% reduction)`);
  }
}

main().catch(console.error);
