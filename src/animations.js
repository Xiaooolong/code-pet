// animations.js - Per-state animation parameter variants
// Each state cycles through 2-3 variants to avoid looking mechanical.
// Returns modifier params that poses use (speed, amplitude, etc.)

const variants = {
  idle: [
    { breatheSpeed: 2, breatheAmp: 2, blinkInterval: 4 },
    { breatheSpeed: 1.5, breatheAmp: 3, blinkInterval: 6 },
    { breatheSpeed: 2.5, breatheAmp: 1.5, blinkInterval: 3 },
  ],
  thinking: [
    { tiltSpeed: 1.5, tiltAmp: 3 },
    { tiltSpeed: 1, tiltAmp: 5 },
    { tiltSpeed: 2, tiltAmp: 2 },
  ],
  coding: [
    { handSpeed: 8, handAmp: 4 },
    { handSpeed: 12, handAmp: 2 },
    { handSpeed: 6, handAmp: 6 },
  ],
  reading: [
    { flipSpeed: 2 },
    { flipSpeed: 3 },
  ],
  running: [
    { swingSpeed: 5, swingAmp: 8 },
    { swingSpeed: 7, swingAmp: 5 },
    { swingSpeed: 4, swingAmp: 10 },
  ],
  celebrate: [
    { bounceSpeed: 6, bounceAmp: 10 },
    { bounceSpeed: 8, bounceAmp: 7 },
  ],
  error: [
    { shakeSpeed: 15, shakeAmp: 3 },
    { shakeSpeed: 20, shakeAmp: 2 },
    { shakeSpeed: 10, shakeAmp: 5 },
  ],
  user_typing: [
    { scribbleSpeed: 10, nodSpeed: 4 },
    { scribbleSpeed: 14, nodSpeed: 3 },
    { scribbleSpeed: 8, nodSpeed: 5 },
  ],
};

// How often to switch variant (seconds)
const VARIANT_CYCLE_SECS = 8;

export function getVariant(state, time) {
  const stateVariants = variants[state] || variants.idle;
  const idx = Math.floor(time / VARIANT_CYCLE_SECS) % stateVariants.length;
  return stateVariants[idx];
}
