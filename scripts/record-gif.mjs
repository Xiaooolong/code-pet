// record-gif.mjs - Generate animated GIF of all 8 states from code
// Usage: node scripts/record-gif.mjs [output.gif]

import sharp from 'sharp';
import GIFEncoder from 'gif-encoder-2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import rendering modules
import { renderPose, setFrameSeed } from '../src/renderer.js';
import { renderDecorations } from '../src/decorations.js';

const STATES = ['idle', 'thinking', 'coding', 'reading', 'running', 'celebrate', 'error', 'user_typing'];
const LABELS = ['IDLE', 'THINKING', 'CODING', 'READING', 'RUNNING', 'CELEBRATE', 'ERROR', 'USER TYPING'];

const COLS = 4, ROWS = 2;
const CELL_W = 180, CELL_H = 200;
const PAD = 14;
const LABEL_H = 26;
const TOTAL_W = COLS * (CELL_W + PAD) + PAD;
const TOTAL_H = ROWS * (CELL_H + LABEL_H + PAD) + PAD;

// Fix SVG text content that contains XML-breaking chars like </>
function escapeTextContent(svg) {
  return svg.replace(/>([^<]*)</g, (match, text, offset) => {
    if (!text || !text.includes('<')) return match;
    // Only escape < inside text node content, not in tags
    return '>' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '<';
  });
}

function sanitizeSvg(svg) {
  // Remove HTML comments (not valid in strict XML SVG parsing)
  let s = svg.replace(/<!--[\s\S]*?-->/g, '');
  // Escape < > inside <text>...</text> content
  s = s.replace(/<text([^>]*)>([^<]*(?:<(?!\/text)[^<]*)*)<\/text>/g, (match, attrs, content) => {
    const safe = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<text${attrs}>${safe}</text>`;
  });
  return s;
}

function generateFrameSvg(t) {
  setFrameSeed(t);
  const parts = [];

  for (let i = 0; i < STATES.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CELL_W + PAD);
    const y = PAD + row * (CELL_H + LABEL_H + PAD);

    const pose = sanitizeSvg(renderPose(STATES[i], t));
    const deco = sanitizeSvg(renderDecorations(STATES[i], t));

    parts.push(`
      <rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H + LABEL_H}" rx="10" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="1.5"/>
      <text x="${x + CELL_W / 2}" y="${y + 17}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#999" text-anchor="middle" letter-spacing="0.5">${LABELS[i]}</text>
      <svg x="${x}" y="${y + LABEL_H}" width="${CELL_W}" height="${CELL_H}" viewBox="0 0 150 180">
        ${pose}${deco}
      </svg>
    `);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TOTAL_W}" height="${TOTAL_H}">
    <rect width="100%" height="100%" fill="#0f0f0f"/>
    ${parts.join('')}
  </svg>`;
}

async function main() {
  const output = process.argv[2] || path.join(__dirname, '..', 'code-pet-animations.gif');
  const FPS = 15;
  const DURATION = 4;
  const totalFrames = FPS * DURATION;
  const delay = Math.round(1000 / FPS);

  console.log(`Recording ${totalFrames} frames at ${FPS}fps (${DURATION}s), ${TOTAL_W}x${TOTAL_H}px`);

  const encoder = new GIFEncoder(TOTAL_W, TOTAL_H);
  encoder.setDelay(delay);
  encoder.setRepeat(0);
  encoder.setQuality(10);
  encoder.start();

  let t = 0;
  const dt = 1 / FPS;

  for (let i = 0; i < totalFrames; i++) {
    t += dt;
    const svg = generateFrameSvg(t);
    const raw = await sharp(Buffer.from(svg))
      .raw()
      .ensureAlpha()
      .toBuffer();

    encoder.addFrame(raw);
    process.stdout.write(`\r  Frame ${i + 1}/${totalFrames}`);
  }

  encoder.finish();
  const buf = encoder.out.getData();
  fs.writeFileSync(output, buf);
  console.log(`\nDone! ${output} (${(buf.length / 1024).toFixed(0)}KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
