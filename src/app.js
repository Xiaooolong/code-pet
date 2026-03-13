import { renderPose } from './renderer.js';
import { renderDecorations } from './decorations.js';

const svg = document.getElementById('pet-svg');
const container = document.getElementById('pet-container');

// State machine
let currentState = 'idle';
let previousHookState = 'idle';
let isUserTyping = false;
let animTime = 0;
let lastFrameTime = performance.now();
let isVisible = true;

// Transition
let transitioning = false;
let transitionProgress = 0;
let transitionFrom = 'idle';
const TRANSITION_DURATION = 300;

function getEffectiveState() {
  if (isUserTyping) return 'user_typing';
  return currentState;
}

function setState(newState) {
  const effective = getEffectiveState();
  if (newState === effective) return;

  if (isUserTyping && newState !== 'user_typing') {
    previousHookState = newState;
    currentState = newState;
    return;
  }

  transitionFrom = effective;
  currentState = newState;
  transitioning = true;
  transitionProgress = 0;
}

// Tauri v2 event listeners
async function setupTauriV2() {
  try {
    const { listen } = window.__TAURI__.event;

    await listen('pet-state-change', (e) => {
      setState(e.payload);
      previousHookState = e.payload;
    });

    await listen('user-typing-change', (e) => {
      isUserTyping = e.payload;
      if (!isUserTyping) {
        setState(previousHookState);
      }
    });

    console.log('Tauri v2 event listeners ready');
  } catch (err) {
    console.warn('Tauri v2 event setup failed:', err);
  }
}

// Animation loop
function animate(now) {
  if (!isVisible) {
    requestAnimationFrame(animate);
    return;
  }

  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  animTime += dt;

  const effective = getEffectiveState();

  // Handle transition
  if (transitioning) {
    transitionProgress += dt * 1000;
    if (transitionProgress >= TRANSITION_DURATION) {
      transitioning = false;
    }
  }

  let svgContent = '';
  if (transitioning) {
    const alpha = transitionProgress / TRANSITION_DURATION;
    svgContent = `
      <g opacity="${1 - alpha}">${renderPose(transitionFrom, animTime)}${renderDecorations(transitionFrom, animTime)}</g>
      <g opacity="${alpha}">${renderPose(effective, animTime)}${renderDecorations(effective, animTime)}</g>
    `;
  } else {
    svgContent = renderPose(effective, animTime) + renderDecorations(effective, animTime);
  }

  svg.innerHTML = svgContent;
  requestAnimationFrame(animate);
}

// Visibility detection
document.addEventListener('visibilitychange', () => {
  isVisible = !document.hidden;
  if (isVisible) {
    lastFrameTime = performance.now();
  }
});

// Drag support
let isDragging = false;
let dragStartX, dragStartY;

container.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isDragging = true;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
  }
});

document.addEventListener('mousemove', async (e) => {
  if (!isDragging) return;
  if (!window.__TAURI__) return;

  try {
    const { getCurrentWindow } = window.__TAURI__.window;
    const win = getCurrentWindow();
    const factor = await win.scaleFactor();
    const pos = await win.outerPosition();
    const logicalPos = pos.toLogical(factor);
    const dx = e.screenX - dragStartX;
    const dy = e.screenY - dragStartY;
    await win.setPosition(new window.__TAURI__.window.LogicalPosition(
      logicalPos.x + dx,
      logicalPos.y + dy
    ));
    dragStartX = e.screenX;
    dragStartY = e.screenY;
  } catch (err) {
    // Ignore drag errors
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Hover interaction: character looks up at cursor
let isHovering = false;
container.addEventListener('mouseenter', () => { isHovering = true; });
container.addEventListener('mouseleave', () => { isHovering = false; });

// Click interaction: different response per state
let clickReacting = false;
container.addEventListener('click', () => {
  if (clickReacting) return;
  clickReacting = true;
  const effective = getEffectiveState();
  const reactions = {
    idle: 'celebrate',
    thinking: 'idle',
    coding: 'celebrate',
    reading: 'thinking',
    running: 'error',
    celebrate: 'idle',
    error: 'thinking',
    user_typing: 'celebrate'
  };
  const reaction = reactions[effective] || 'celebrate';
  setState(reaction);
  setTimeout(() => {
    setState(previousHookState);
    clickReacting = false;
  }, 1500);
});

// Right-click context menu (HTML-based, no Tauri menu API needed)
const SIZES = { small: [100, 120], medium: [150, 180], large: [220, 260] };
let currentSize = 'medium';

container.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  document.getElementById('ctx-menu')?.remove();

  const menu = document.createElement('div');
  menu.id = 'ctx-menu';
  menu.style.cssText = 'position:fixed;background:#2a2a2a;border:1px solid #555;border-radius:6px;padding:4px 0;z-index:9999;min-width:140px;font-size:12px;color:#e0e0e0;';
  // Clamp position so menu stays within the small window
  const menuW = 144, menuH = 90;
  const x = Math.min(e.clientX, window.innerWidth - menuW - 2);
  const y = Math.min(e.clientY, window.innerHeight - menuH - 2);
  menu.style.left = Math.max(0, x) + 'px';
  menu.style.top = Math.max(0, y) + 'px';

  const items = [
    { label: 'Reset Position', action: resetPosition },
    { label: `Size: ${currentSize}`, action: cycleSize },
    { label: 'Quit', action: quitApp },
  ];

  items.forEach(({ label, action }) => {
    const item = document.createElement('div');
    item.textContent = label;
    item.style.cssText = 'padding:6px 16px;cursor:pointer;';
    item.addEventListener('mouseenter', () => item.style.background = '#444');
    item.addEventListener('mouseleave', () => item.style.background = 'none');
    item.addEventListener('click', () => { menu.remove(); action(); });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  const dismiss = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', dismiss); }};
  setTimeout(() => document.addEventListener('click', dismiss), 0);
});

async function resetPosition() {
  if (!window.__TAURI__) return;
  const { getCurrentWindow } = window.__TAURI__.window;
  const win = getCurrentWindow();
  const { availWidth, availHeight } = window.screen;
  await win.setPosition(new window.__TAURI__.window.LogicalPosition(
    availWidth - SIZES[currentSize][0] - 20,
    availHeight - SIZES[currentSize][1] - 40
  ));
}

async function cycleSize() {
  const order = ['small', 'medium', 'large'];
  const idx = (order.indexOf(currentSize) + 1) % order.length;
  currentSize = order[idx];
  const [w, h] = SIZES[currentSize];
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  container.style.width = w + 'px';
  container.style.height = h + 'px';
  if (window.__TAURI__) {
    const { getCurrentWindow } = window.__TAURI__.window;
    const win = getCurrentWindow();
    await win.setSize(new window.__TAURI__.window.LogicalSize(w, h));
  }
}

async function quitApp() {
  if (window.__TAURI__) {
    const { invoke } = window.__TAURI__.core;
    await invoke('quit_app');
  }
}

// Initialize
setupTauriV2();
requestAnimationFrame(animate);
