// renderer.js - SVG doodle character poses for each state
// Each pose returns an SVG group string to inject into the main SVG

// Deterministic noise for hand-drawn feel (no Math.random per frame)
function noise(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

let frameNoiseSeed = 0;
// Call once per frame to set a stable seed, so paths don't jitter wildly
export function setFrameSeed(t) {
  frameNoiseSeed = Math.floor(t * 4); // changes 4x/sec for subtle wobble
}

function jitter(v, amount = 1.5, idx = 0) {
  return v + (noise(frameNoiseSeed * 13 + idx * 7) - 0.5) * amount;
}

// Shared head shape (irregular circle)
function drawHead(cx, cy, r) {
  const j = (v, i) => jitter(v, 2, i);
  return `<path d="M${cx - r} ${cy}
    Q${j(cx - r, 0)} ${j(cy - r * 1.2, 1)} ${j(cx, 2)} ${cy - r}
    Q${j(cx + r * 1.1, 3)} ${j(cy - r, 4)} ${cx + r} ${j(cy, 5)}
    Q${j(cx + r, 6)} ${j(cy + r * 1.1, 7)} ${j(cx, 8)} ${cy + r}
    Q${j(cx - r * 1.1, 9)} ${j(cy + r, 10)} ${cx - r} ${cy}Z"
    fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linejoin="round"/>`;
}

// Blush cheeks - cute pink circles
function drawBlush(cx, cy, state) {
  let opacity = 0.4;
  let r = 4;
  if (state === 'celebrate') { opacity = 0.7; r = 5; }
  if (state === 'error') { opacity = 0.6; r = 5; }
  if (state === 'coding') { opacity = 0.5; }
  if (state === 'running') { opacity = 0.6; r = 5; }
  return `
    <ellipse cx="${cx - 15}" cy="${cy + 5}" rx="${r}" ry="${r * 0.6}" fill="#ff8a9e" opacity="${opacity}"/>
    <ellipse cx="${cx + 15}" cy="${cy + 5}" rx="${r}" ry="${r * 0.6}" fill="#ff8a9e" opacity="${opacity}"/>`;
}

// Shared eyes - more expressive per state
function drawEyes(cx, cy, state) {
  if (state === 'error') {
    // Spinning X eyes
    return `
      <line x1="${cx - 13}" y1="${cy - 4}" x2="${cx - 5}" y2="${cy + 4}" stroke="#e0e0e0" stroke-width="2"/>
      <line x1="${cx - 5}" y1="${cy - 4}" x2="${cx - 13}" y2="${cy + 4}" stroke="#e0e0e0" stroke-width="2"/>
      <line x1="${cx + 5}" y1="${cy - 4}" x2="${cx + 13}" y2="${cy + 4}" stroke="#e0e0e0" stroke-width="2"/>
      <line x1="${cx + 13}" y1="${cy - 4}" x2="${cx + 5}" y2="${cy + 4}" stroke="#e0e0e0" stroke-width="2"/>`;
  }
  if (state === 'celebrate') {
    // Big happy ^ ^ eyes
    return `
      <path d="M${cx - 14} ${cy + 2} Q${cx - 9} ${cy - 7} ${cx - 4} ${cy + 2}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M${cx + 4} ${cy + 2} Q${cx + 9} ${cy - 7} ${cx + 14} ${cy + 2}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>`;
  }
  if (state === 'coding') {
    // Focused dot eyes - intense stare
    return `
      <circle cx="${cx - 8}" cy="${cy}" r="2" fill="#e0e0e0"/>
      <circle cx="${cx + 8}" cy="${cy}" r="2" fill="#e0e0e0"/>`;
  }
  if (state === 'thinking') {
    // One eye bigger, looking up
    return `
      <circle cx="${cx - 9}" cy="${cy - 2}" r="4" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx - 8}" cy="${cy - 3}" r="1.8" fill="#e0e0e0"/>
      <circle cx="${cx + 9}" cy="${cy - 1}" r="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx + 10}" cy="${cy - 3}" r="2.2" fill="#e0e0e0"/>`;
  }
  if (state === 'running') {
    // Wide panicked eyes
    return `
      <circle cx="${cx - 9}" cy="${cy}" r="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx - 9}" cy="${cy}" r="2" fill="#e0e0e0"/>
      <circle cx="${cx + 9}" cy="${cy}" r="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx + 9}" cy="${cy}" r="2" fill="#e0e0e0"/>`;
  }
  if (state === 'reading') {
    // Open eyes looking downward at book
    return `
      <circle cx="${cx - 8}" cy="${cy}" r="4" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx - 8}" cy="${cy + 2}" r="1.5" fill="#e0e0e0"/>
      <circle cx="${cx + 8}" cy="${cy}" r="4" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx + 8}" cy="${cy + 2}" r="1.5" fill="#e0e0e0"/>`;
  }
  if (state === 'user_typing') {
    // Panicked wide eyes
    return `
      <circle cx="${cx - 8}" cy="${cy}" r="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx - 8}" cy="${cy}" r="2.5" fill="#e0e0e0"/>
      <circle cx="${cx + 8}" cy="${cy}" r="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <circle cx="${cx + 8}" cy="${cy}" r="2.5" fill="#e0e0e0"/>`;
  }
  // Normal asymmetric eyes (idle)
  return `
    <circle cx="${cx - 9}" cy="${cy}" r="3.5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
    <circle cx="${cx - 8}" cy="${cy + 1}" r="1.5" fill="#e0e0e0"/>
    <circle cx="${cx + 9}" cy="${cy}" r="4" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
    <circle cx="${cx + 10}" cy="${cy + 1}" r="1.8" fill="#e0e0e0"/>`;
}

// Shared mouth - more expressive
function drawMouth(cx, cy, state) {
  if (state === 'celebrate') {
    // Big open grin
    return `<path d="M${cx - 10} ${cy - 1} Q${cx} ${cy + 14} ${cx + 10} ${cy - 1}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>`;
  }
  if (state === 'error') {
    // Wobbly frown
    return `<path d="M${cx - 8} ${cy + 6} Q${cx - 3} ${cy - 1} ${cx} ${cy + 3} Q${cx + 3} ${cy - 1} ${cx + 8} ${cy + 6}" fill="none" stroke="#e0e0e0" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  if (state === 'coding') {
    // Tight determined line with slight curl
    return `<path d="M${cx - 5} ${cy + 1} L${cx + 3} ${cy} L${cx + 6} ${cy - 2}" fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  if (state === 'running') {
    // Open mouth panting
    return `<ellipse cx="${cx}" cy="${cy + 3}" rx="5" ry="4" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>`;
  }
  if (state === 'thinking') {
    // Small 'o' mouth
    return `<circle cx="${cx + 2}" cy="${cy + 2}" r="3" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>`;
  }
  if (state === 'user_typing') {
    // Panicked open mouth
    return `<ellipse cx="${cx}" cy="${cy + 3}" rx="4" ry="5" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>`;
  }
  if (state === 'reading') {
    // Quiet content line
    return `<path d="M${cx - 4} ${cy + 1} Q${cx} ${cy + 3} ${cx + 4} ${cy + 1}" fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  // Subtle smile (idle)
  return `<path d="M${cx - 6} ${cy} Q${cx} ${cy + 5} ${cx + 6} ${cy}" fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round"/>`;
}

// Draw chaotic thinking scribble above head using Lissajous curves
function drawThinkingScribble(cx, cy, t) {
  const curves = [];
  const centerY = cy - 12;
  // Asymmetric tangled scribble: open curves with noise perturbation
  // Each strand has different length, speed, and offset to break symmetry
  const strands = [
    { freq: 2.7, amp: 7, yAmp: 4, speed: 3.5, offX: -2, offY: 1, steps: 35, w: 1.3, op: 0.6 },
    { freq: 4.1, amp: 5, yAmp: 3.5, speed: 5.0, offX: 2, offY: -0.5, steps: 28, w: 1.0, op: 0.5 },
    { freq: 5.7, amp: 4, yAmp: 2.5, speed: 4.2, offX: -0.5, offY: 1.5, steps: 22, w: 0.8, op: 0.4 },
  ];
  for (const { freq, amp, yAmp, speed, offX, offY, steps, w, op } of strands) {
    const pts = [];
    const phase = t * speed;
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * Math.PI * 2.3; // NOT a full loop = open curve
      // Strong per-point noise for chaotic feel
      const noiseX = Math.sin(i * 7.3 + phase * 1.8) * 2.5 + Math.cos(i * 3.1 + phase * 2.5) * 1.5;
      const noiseY = Math.cos(i * 5.1 + phase * 2.2) * 2 + Math.sin(i * 11.7 + phase * 1.3) * 1.5;
      const px = cx + offX + amp * Math.sin(freq * s + phase) + noiseX;
      const py = centerY + offY + yAmp * Math.sin((freq * 0.7) * s + phase * 0.6) + noiseY;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    curves.push(`<polyline points="${pts.join(' ')}"
      fill="none" stroke="#e0e0e0" stroke-width="${w}" opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  // Small connecting tail from head to scribble cloud
  const tailWobble = Math.sin(t * 4) * 3;
  curves.push(`<path d="M${cx} ${cy - 5} Q${cx + tailWobble} ${cy - 14} ${cx - tailWobble} ${cy - 20}"
    fill="none" stroke="#e0e0e0" stroke-width="1" opacity="0.4" stroke-linecap="round"/>`);
  return curves.join('');
}

export const poses = {
  idle(t) {
    const breathe = Math.sin(t * 2) * 2;
    return `<g transform="translate(75, 10)">
      ${drawHead(0, 22, 18)}
      ${drawBlush(0, 22, 'idle')}
      ${drawEyes(0, 20, 'idle')}
      ${drawMouth(0, 32, 'idle')}
      <path d="M0 40 Q-2 70 0 ${90 + breathe}" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-3 55 Q-25 52 -30 68" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 57 Q25 54 28 72" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M-2 ${90 + breathe} Q-12 ${120 + breathe} -20 ${140 + breathe}" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M2 ${90 + breathe} Q12 ${120 + breathe} 22 ${140 + breathe}" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  },

  thinking(t) {
    const t15 = t * 1.5; // 1.5x speed
    const tilt = Math.sin(t15 * 1.2) * 8;
    const scratch = Math.sin(t15 * 6) * 2;
    return `<g transform="translate(75, 18)">
      <g transform="rotate(${tilt}, 0, 22)">
        ${drawHead(0, 22, 18)}
        ${drawBlush(0, 22, 'thinking')}
        ${drawEyes(0, 20, 'thinking')}
        ${drawMouth(0, 32, 'thinking')}
      </g>
      ${drawThinkingScribble(0, 0, t15)}
      <path d="M0 40 Q-4 65 -2 88" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-3 50 Q-18 38 ${-14 + scratch} ${24 + scratch}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 55 Q25 52 30 68" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M-3 88 Q-12 116 -20 138" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M1 88 Q10 116 20 138" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  },

  coding(t) {
    // Frantic typing - 1.5x speed for manic energy
    const t15 = t * 1.5;
    const handL = Math.sin(t15 * 16) * 5;
    const handR = Math.cos(t15 * 16) * 5;
    const hunch = Math.sin(t15 * 12) * 1.5;
    const headBob = Math.sin(t15 * 8) * 2;
    // Screen flicker lines
    const flickerY1 = 78 + (t15 * 50 % 30);
    const flickerY2 = 75 + (t15 * 70 % 30);
    return `<g transform="translate(75, 10)">
      <g transform="translate(0, ${headBob})">
        ${drawHead(0, 22, 18)}
        ${drawBlush(0, 22, 'coding')}
        ${drawEyes(0, 20, 'coding')}
        ${drawMouth(0, 31, 'coding')}
      </g>
      <path d="M0 40 Q${-3 + hunch} 58 ${-2 + hunch} 76" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-3 50 Q-22 60 ${-28 + handL} ${72 + handL}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 52 Q22 62 ${28 + handR} ${74 + handR}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M-2 76 Q${-10 + hunch} ${100 + hunch} ${-16 + hunch * 1.5} 120" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M2 76 Q${10 + hunch} ${100 - hunch} ${16 + hunch * 1.5} 120" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="-32" y="73" width="64" height="40" rx="3" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
      <line x1="-24" y1="${flickerY1 + 8}" x2="${-5 + Math.sin(t15 * 20) * 8}" y2="${flickerY1 + 8}" stroke="#e0e0e0" stroke-width="1" opacity="0.7"/>
      <line x1="-22" y1="${flickerY2 + 8}" x2="${12 + Math.cos(t15 * 15) * 6}" y2="${flickerY2 + 8}" stroke="#e0e0e0" stroke-width="1" opacity="0.5"/>
      <line x1="-20" y1="${84 + (t15 * 90 % 25)}" x2="${3 + Math.sin(t15 * 25) * 5}" y2="${84 + (t15 * 90 % 25)}" stroke="#e0e0e0" stroke-width="0.8" opacity="0.4"/>
    </g>`;
  },

  reading(t) {
    const pageFlip = Math.sin(t * 3);
    const eyeScan = Math.sin(t * 2) * 3;
    return `<g transform="translate(75, 10)">
      <g transform="rotate(${-5 + Math.sin(t * 0.8) * 2}, 0, 22)">
        ${drawHead(0, 22, 18)}
        ${drawBlush(0, 22, 'reading')}
        ${drawEyes(0, 20, 'reading')}
        ${drawMouth(0, 32, 'reading')}
      </g>
      <path d="M0 40 Q-3 65 -2 88" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <!-- left arm: relaxed down -->
      <path d="M-3 55 Q-22 58 -28 72" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <!-- right arm: holding book at lower-left edge -->
      <path d="M3 55 Q18 58 22 66" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M-2 88 Q-10 112 -18 135" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M2 88 Q10 112 18 135" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <!-- book: held in right hand, tilted slightly -->
      <g transform="translate(22, 48) rotate(-5)">
        <path d="M0 0 Q5 -3 10 0" fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M10 0 Q15 -3 20 0" fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="0" y1="0" x2="0" y2="24" stroke="#e0e0e0" stroke-width="1.2"/>
        <line x1="20" y1="0" x2="20" y2="24" stroke="#e0e0e0" stroke-width="1.2"/>
        <path d="M0 24 Q5 27 10 24" fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M10 24 Q15 27 20 24" fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="10" y1="0" x2="10" y2="24" stroke="#e0e0e0" stroke-width="0.8"/>
        <line x1="3" y1="6" x2="8" y2="6" stroke="#e0e0e0" stroke-width="0.5" opacity="0.4"/>
        <line x1="3" y1="10" x2="7" y2="10" stroke="#e0e0e0" stroke-width="0.5" opacity="0.4"/>
        <line x1="12" y1="6" x2="18" y2="6" stroke="#e0e0e0" stroke-width="0.5" opacity="0.4"/>
        <line x1="12" y1="10" x2="16" y2="10" stroke="#e0e0e0" stroke-width="0.5" opacity="0.4"/>
        ${pageFlip > 0.8 ? `<path d="M18 0 Q22 12 18 24" fill="none" stroke="#e0e0e0" stroke-width="0.6" opacity="0.4"/>` : ''}
      </g>
    </g>`;
  },

  running(t) {
    // Rushing forward: heavy lean, legs scissors, speed lines
    const s = Math.sin(t * 9);
    const bounce = Math.abs(s) * 4;
    const lean = 18;
    // Leg angles: one forward one back, alternating
    const legA = s * 25;       // front-back swing angle
    // Arms: opposite to legs, bent close to body
    const armA = -s * 20;
    return `<g transform="translate(75, ${14 - bounce})">
      <g transform="rotate(${lean}, 0, 90)">
        ${drawHead(0, 22, 18)}
        ${drawBlush(0, 22, 'running')}
        ${drawEyes(0, 20, 'running')}
        ${drawMouth(0, 32, 'running')}
        <path d="M0 40 Q-2 60 -1 82" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
        <!-- arms: swing from shoulder, bent elbow, hand up -->
        ${(() => {
          const sArmL = Math.sin(t * 9 + Math.PI);
          const sArmR = s;
          const armPath = (ox, sVal) => {
            const rot = 15 - sVal * 35;
            return `<g transform="rotate(${rot}, ${ox}, 50)">
              <path d="M${ox} 50 Q${ox + 14} 52 ${ox + 6} 38" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
            </g>`;
          };
          return armPath(-3, sArmL) + armPath(3, sArmR);
        })()}
        <!-- legs: same shape, bend amount varies smoothly with swing -->
        <!-- bend = 0 (straight) when back, bend = 1 (knee bent) when forward -->
        ${(() => {
          const sR = Math.sin(t * 9 + Math.PI); // half cycle offset
          const bendL = Math.max(0, -s);
          const bendR = Math.max(0, -sR);
          const legRotL = s * 25;
          const legRotR = sR * 25;
          const legPath = (ox, bend, rot) => {
            const bow = bend * 14;
            const tuck = bend * 18;
            return `<g transform="rotate(${rot}, 0, 82)">
              <path d="M${ox} 82 C${ox + (6 + bow)} 96 ${ox + (10 + bow)} ${118 - tuck} ${ox + 14} ${140 - tuck}" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
            </g>`;
          };
          return legPath(-2, bendL, legRotL) + legPath(2, bendR, legRotR);
        })()}
      </g>
      <!-- speed lines behind (opposite to lean direction) -->
      ${[0,1,2].map(i => {
        const ly = 40 + i * 22;
        const phase = (t * 40 + i * 13) % 30;
        const op = Math.max(0, 1 - phase / 30);
        return `<line x1="${-20 - phase}" y1="${ly}" x2="${-10 - phase}" y2="${ly}" stroke="#e0e0e0" stroke-width="1.2" opacity="${op * 0.5}" stroke-linecap="round"/>`;
      }).join('')}
    </g>`;
  },

  celebrate(t) {
    const bounce = Math.abs(Math.sin(t * 6)) * 10;
    const armRot = Math.sin(t * 8) * 15; // rotate arms, not stretch
    return `<g transform="translate(75, ${18 - bounce})">
      ${drawHead(0, 22, 18)}
      ${drawBlush(0, 22, 'celebrate')}
      ${drawEyes(0, 20, 'celebrate')}
      ${drawMouth(0, 32, 'celebrate')}
      <path d="M0 40 Q-2 65 0 88" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <g transform="rotate(${armRot}, -3, 48)">
        <path d="M-3 48 Q-28 32 -35 20" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g transform="rotate(${-armRot}, 3, 48)">
        <path d="M3 48 Q28 32 35 20" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      </g>
      <path d="M-1 88 Q-10 112 -18 138" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M1 88 Q10 112 18 138" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  },

  error(t) {
    const shake = Math.sin(t * 18) * 5;
    const collapse = Math.min(t * 0.5, 1) * 8;
    return `<g transform="translate(${75 + shake}, ${30 + collapse})">
      ${drawHead(0, 22, 18)}
      ${drawBlush(0, 22, 'error')}
      ${drawEyes(0, 20, 'error')}
      ${drawMouth(0, 32, 'error')}
      <path d="M0 40 Q${-5 + shake * 0.3} 52 -8 62" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-6 48 Q-28 50 -35 58" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M2 50 Q18 44 24 50" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M-10 62 Q-28 72 -38 85" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-6 62 Q8 75 18 85" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  },

  user_typing(t) {
    // Catching falling characters: arms reaching left/right, body swaying
    // Panicked running left-right catching falling chars
    const reach = Math.sin(t * 3.5);  // which direction to run
    const runX = reach * 20;           // lateral movement
    const legCycle = t * 10;           // fast leg cycle
    const sL = Math.sin(legCycle);
    const sR = Math.sin(legCycle + Math.PI);
    const bounce = Math.abs(sL) * 3;
    const bendL = Math.max(0, -sL);
    const bendR = Math.max(0, -sR);
    // Catching arm: whichever side we're running toward goes up
    const leftArmUp = Math.max(0, -reach);
    const rightArmUp = Math.max(0, reach);
    return `<g transform="translate(${75 + runX}, ${12 - bounce})">
      ${drawHead(0, 22, 18)}
      ${drawBlush(0, 22, 'user_typing')}
      ${drawEyes(0, 20, 'user_typing')}
      ${drawMouth(0, 32, 'user_typing')}
      <path d="M0 40 Q-2 65 -1 88" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
      <!-- arms: one reaching up to catch, other down -->
      <path d="M-3 50 Q${-18 - leftArmUp * 8} ${46 - leftArmUp * 16} ${-22 - leftArmUp * 6} ${35 - leftArmUp * 14}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <path d="M3 50 Q${18 + rightArmUp * 8} ${46 - rightArmUp * 16} ${22 + rightArmUp * 6} ${35 - rightArmUp * 14}" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      <!-- legs: running fast -->
      ${(() => {
        const legPath = (ox, bend, rot) => {
          const bow = bend * 14;
          const tuck = bend * 18;
          return '<g transform="rotate(' + rot + ', ' + ox + ', 88)">' +
            '<path d="M' + ox + ' 88 C' + (ox + 6 + bow) + ' 102 ' + (ox + 10 + bow) + ' ' + (124 - tuck) + ' ' + (ox + 14) + ' ' + (146 - tuck) + '" fill="none" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>' +
            '</g>';
        };
        return legPath(-2, bendL, sL * 25) + legPath(2, bendR, sR * 25);
      })()}
    </g>`;
  },
};

export function renderPose(state, time) {
  setFrameSeed(time);
  const poseFn = poses[state] || poses.idle;
  return poseFn(time);
}
