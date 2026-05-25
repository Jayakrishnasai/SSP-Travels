import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const FRAME_COUNT = 299;
const CONFIGS = ['desktop', 'mobile'];

for (const cfg of CONFIGS) {
  const inputDir = path.join(ROOT, 'public', 'FrameBusesWebP', cfg);
  const outDir = path.join(ROOT, 'public', 'bundles', cfg);
  fs.mkdirSync(outDir, { recursive: true });

  const frameData = [];

  for (let i = 0; i < FRAME_COUNT; i++) {
    const padded = String(i).padStart(3, '0');
    const filePath = path.join(inputDir, `frame_${padded}.webp`);

    if (!fs.existsSync(filePath)) {
      console.warn(`Missing: ${filePath}`);
      frameData.push(Buffer.alloc(0));
      continue;
    }

    frameData.push(fs.readFileSync(filePath));
  }

  const frameCount = frameData.length;
  const indexEntrySize = 8; // offset(4) + size(4)
  const headerSize = 12 + frameCount * indexEntrySize; // magic(4) + count(4) + indexByteSize(4) + entries

  // Calculate frame offsets (absolute within file)
  let dataCursor = headerSize;
  const entries = frameData.map((data) => {
    const entry = { offset: dataCursor, size: data.length };
    dataCursor += data.length;
    return entry;
  });

  const totalSize = dataCursor;
  const buffer = Buffer.alloc(totalSize);

  // Write header
  buffer.writeUInt32LE(0x50534246, 0); // magic: "FBSP" (Frame Bundle Single Picture)
  buffer.writeUInt32LE(frameCount, 4);
  buffer.writeUInt32LE(frameCount * indexEntrySize, 8); // index byte size

  // Write index
  for (let i = 0; i < frameCount; i++) {
    const idxOffset = 12 + i * indexEntrySize;
    buffer.writeUInt32LE(entries[i].offset, idxOffset);
    buffer.writeUInt32LE(entries[i].size, idxOffset + 4);
  }

  // Write frame data
  let writePos = headerSize;
  for (const data of frameData) {
    data.copy(buffer, writePos);
    writePos += data.length;
  }

  const outPath = path.join(outDir, 'frames.bundle');
  fs.writeFileSync(outPath, buffer);

  const mb = (totalSize / 1024 / 1024).toFixed(1);
  console.log(`Bundled ${cfg}: ${frameCount} frames → ${outPath} (${mb} MB)`);
}

console.log('Done');
