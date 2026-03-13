// decorations.js - Hand-drawn SVG decoration elements for each state
// Note: decorations use time-based deterministic motion (sin/cos),
// no random jitter needed here since elements are animated continuously.

let _typingStartTime = -1;
let _lastTypingT = -1;

export const decorations = {
  idle(t) {
    const drift = Math.sin(t * 0.8) * 3;
    const opacity = Math.max(0, Math.sin(t * 0.5));
    if (opacity < 0.1) return '';
    // Hand-drawn Z paths instead of text - wobbly, sketchy strokes
    const z1x = 102 + drift, z1y = 25 - drift;
    const z2x = 114 + drift * 0.7, z2y = 16 - drift * 1.2;
    const z3x = 123 + drift * 0.5, z3y = 9 - drift * 1.5;
    const w = Math.sin(t * 1.5) * 0.5; // wobble
    return `<g opacity="${opacity * 0.6}">
      <path d="M${z1x} ${z1y} L${z1x + 11 + w} ${z1y + 1} L${z1x + 1 - w} ${z1y + 13} L${z1x + 12 + w} ${z1y + 14}"
        fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        transform="rotate(-15, ${z1x + 6}, ${z1y + 7})"/>
      <path d="M${z2x} ${z2y} L${z2x + 8 - w} ${z2y + 0.5} L${z2x + 1 + w} ${z2y + 9} L${z2x + 9 - w} ${z2y + 10}"
        fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        transform="rotate(-10, ${z2x + 4}, ${z2y + 5})"/>
      <path d="M${z3x} ${z3y} L${z3x + 5 + w} ${z3y} L${z3x + 1} ${z3y + 6} L${z3x + 6} ${z3y + 6.5}"
        fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
  },

  thinking(t) {
    // Floating question marks and symbols - bigger, denser, 2x speed
    const t2 = t * 2;
    const chars = ['?', '?', '!', '...', '?'];
    const marks = [];
    for (let i = 0; i < 4; i++) {
      const phase = (t2 * 1.2 + i * 2) % 5;
      if (phase < 3.5) {
        const opacity = phase < 1 ? phase : phase > 2.5 ? 3.5 - phase : 1;
        const x = 95 + i * 10 + Math.sin(t2 * 0.8 + i * 1.5) * 6;
        const y = 50 - phase * 7;
        const size = 13 - i * 1.5;
        marks.push(`<text x="${x}" y="${y}" font-family="serif" font-size="${size}" fill="#e0e0e0" opacity="${opacity * 0.6}">${chars[i % chars.length]}</text>`);
      }
    }
    return marks.join('');
  },

  coding(t) {
    // Floating code symbols - bigger, denser, 2x speed
    const t2 = t * 2;
    const symbols = ['</>', '{ }', '( )', '[ ]', '0x', '//', '&&', '=>'];
    const particles = [];
    for (let i = 0; i < 3; i++) {
      const offset = i * 1.7;
      const idx = Math.floor(t2 * 1.5 + i * 2.3) % symbols.length;
      const rise = (t2 * 30 + i * 17) % 55;
      const opacity = Math.max(0, 1 - rise / 55);
      const x = 95 + Math.sin(t2 * 2 + offset) * 12 + i * 8;
      const y = 65 - rise;
      particles.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="12" fill="#e0e0e0" opacity="${opacity * 0.7}"
        transform="rotate(${Math.sin(t2 * 1.5 + offset) * 20}, ${x}, ${y})">${symbols[idx]}</text>`);
    }
    return particles.join('');
  },

  reading(t) {
    // Fun words floating up from the book
    const words = ['wow', 'hmm', 'aha', 'oh!', 'neat', 'huh', 'cool', 'yay', 'ooh', 'whoa'];
    const bits = [];
    for (let i = 0; i < 4; i++) {
      const phase = (t * 0.9 + i * 1.6) % 5.5;
      if (phase < 4.5) {
        const opacity = phase < 0.8 ? phase / 0.8 : (4.5 - phase) / 3.7;
        const cycle = Math.floor((t * 0.9 + i * 1.6) / 5.5);
        const idx = (cycle * 3 + i * 7) % words.length;
        const x = 93 + (i % 2) * 16 + Math.sin(t * 0.8 + i * 3) * 5;
        const y = 65 - phase * 8;
        const rot = Math.sin(t * 0.5 + i * 2) * 12;
        bits.push(`<text x="${x}" y="${y}" font-family="serif" font-size="11" fill="#e0e0e0"
          opacity="${opacity * 0.5}" transform="rotate(${rot}, ${x}, ${y})">${words[idx]}</text>`);
      }
    }
    return bits.join('');
  },

  running(t) {
    const drip = (t * 40) % 30;
    return `<g>
      <path d="M${95 + Math.sin(t) * 3} ${20 + drip}
        Q${97 + Math.sin(t) * 3} ${18 + drip} ${96 + Math.sin(t) * 3} ${16 + drip}"
        fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round"
        opacity="${Math.max(0, 1 - drip / 30)}"/>
      <path d="M${105 + Math.cos(t * 1.3) * 2} ${24 + drip * 0.8}
        Q${107 + Math.cos(t * 1.3) * 2} ${22 + drip * 0.8} ${106 + Math.cos(t * 1.3) * 2} ${20 + drip * 0.8}"
        fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"
        opacity="${Math.max(0, 1 - drip * 0.8 / 30)}"/>
    </g>`;
  },

  celebrate(t) {
    let result = '';
    // Sparkle stars bursting outward
    for (let i = 0; i < 5; i++) {
      const angle = (t * 2 + i * 1.3) % (Math.PI * 2);
      const r = 35 + i * 8;
      const x = 75 + Math.cos(angle) * r;
      const y = 30 + Math.sin(angle) * r * 0.6 - t * 10 % 40;
      const size = 4 + (i % 3);
      const opacity = Math.max(0, 1 - ((t * 10 + i * 7) % 40) / 40);
      result += `<g transform="translate(${x}, ${y}) rotate(${t * 100 + i * 45})" opacity="${opacity}">
        <line x1="${-size}" y1="0" x2="${size}" y2="0" stroke="#e0e0e0" stroke-width="1.2"/>
        <line x1="0" y1="${-size}" x2="0" y2="${size}" stroke="#e0e0e0" stroke-width="1.2"/>
        <line x1="${-size * 0.7}" y1="${-size * 0.7}" x2="${size * 0.7}" y2="${size * 0.7}" stroke="#e0e0e0" stroke-width="0.9"/>
        <line x1="${size * 0.7}" y1="${-size * 0.7}" x2="${-size * 0.7}" y2="${size * 0.7}" stroke="#e0e0e0" stroke-width="0.9"/>
      </g>`;
    }
    // Falling confetti pieces (small rectangles and triangles)
    for (let i = 0; i < 6; i++) {
      const fall = (t * 25 + i * 12) % 70;
      const x = 30 + i * 18 + Math.sin(t * 3 + i * 2) * 8;
      const y = -5 + fall;
      const rot = t * 150 + i * 60;
      const opacity = Math.max(0, 1 - fall / 70);
      if (i % 2 === 0) {
        // Small rectangle confetti
        result += `<rect x="${x}" y="${y}" width="4" height="2.5" rx="0.5"
          fill="none" stroke="#e0e0e0" stroke-width="0.8"
          transform="rotate(${rot}, ${x + 2}, ${y + 1.25})" opacity="${opacity * 0.7}"/>`;
      } else {
        // Small triangle confetti
        result += `<path d="M${x} ${y} L${x + 4} ${y + 1} L${x + 2} ${y + 4}Z"
          fill="none" stroke="#e0e0e0" stroke-width="0.8"
          transform="rotate(${rot}, ${x + 2}, ${y + 2})" opacity="${opacity * 0.7}"/>`;
      }
    }
    return result;
  },

  error(t) {
    const smoke = (t * 20) % 40;
    // Looping explosion: 3s cycle, bang visible for first 1.5s then fades
    const bangPhase = t % 3;
    const bangOp = bangPhase < 0.8 ? 1 : bangPhase < 1.5 ? (1.5 - bangPhase) / 0.7 : 0;
    const bangScale = 0.8 + bangPhase * 0.15;
    const bang = bangOp > 0 ? `<g opacity="${bangOp}" transform="translate(75, 35) scale(${bangScale})">
      <path d="M-15 -5 L-10 -15 L-5 -7 L3 -20 L7 -8 L15 -13 L10 -2 L20 0 L8 5 L13 13 L3 7 L-3 15 L-7 5 L-17 10 L-12 1 L-20 -2Z"
        fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
    </g>` : '';
    const spirals = `<g opacity="${Math.max(0.2, 0.7 - smoke / 60)}">
      <path d="M75 ${25 - smoke} Q${80 + Math.sin(smoke * 0.3) * 5} ${20 - smoke} ${75 + Math.sin(smoke * 0.5) * 8} ${15 - smoke}"
        fill="none" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
    </g>`;
    return bang + spirals;
  },

  user_typing(t) {
    // Track relative time since entering this state
    if (_lastTypingT < 0 || t - _lastTypingT > 0.5) _typingStartTime = t;
    _lastTypingT = t;
    const elapsed = t - _typingStartTime;

    // Characters rain down and pile up at the bottom
    const chars = ['help', 'plz', 'fix', 'bug', 'why', 'how', 'hmm', 'uhh', 'wait', 'todo',
      'asap', 'ugh', 'oops', 'lol', 'brb', 'idk', 'nvm', 'tbh', 'omg', 'wow',
      'hey', '???', '!!!', 'src', 'npm', 'git', 'test', 'run', 'err', 'null'];
    const bits = [];

    // Layer 1: Pile of landed characters at the bottom (grows over time)
    const maxPile = 20;
    const pileCount = Math.min(maxPile, Math.floor(elapsed * 3));
    for (let i = 0; i < pileCount; i++) {
      const h = (i * 7 + 3) % 17;
      const x = 10 + (i * 13.7) % 120;
      const row = Math.floor(i / 7);
      const y = 170 - row * 13 + (h % 5) * 2;
      const rot = ((h * 13) % 30) - 15;
      const idx = (i * 5 + 3) % chars.length;
      const size = 9 + (i % 3) * 2;
      const wobX = Math.sin(t * 0.5 + i * 1.7) * 1;
      const wobR = Math.sin(t * 0.3 + i * 2.1) * 3;
      bits.push(`<text x="${x + wobX}" y="${y}" font-family="monospace" font-size="${size}" fill="#e0e0e0"
        opacity="0.4" transform="rotate(${rot + wobR}, ${x}, ${y})">${chars[idx]}</text>`);
    }

    // Layer 2: Falling characters (rain from above, slower)
    for (let i = 0; i < 8; i++) {
      const speed = 15 + (i % 3) * 8;
      const fall = (t * speed + i * 11) % 55;
      const cycle = Math.floor((t * speed + i * 11) / 55);
      const idx = (cycle * 3 + i * 7) % chars.length;
      const x = 12 + (i * 14) % 118 + Math.sin(t * 1.2 + i * 3) * 4;
      const y = -10 + fall * 3.2;
      const opacity = fall < 5 ? fall / 5 : fall > 42 ? (55 - fall) / 13 : 0.8;
      const rot = Math.sin(t * 2 + i * 2) * 10;
      const size = 10 + (i % 3) * 2;
      bits.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size}" fill="#e0e0e0"
        opacity="${opacity * 0.55}" transform="rotate(${rot}, ${x}, ${y})">${chars[idx]}</text>`);
    }
    return bits.join('');
  },
};

export function renderDecorations(state, time) {
  const decorFn = decorations[state] || (() => '');
  return decorFn(time);
}
