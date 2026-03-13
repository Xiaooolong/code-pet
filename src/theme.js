// theme.js - Dark/Light mode color management

const themes = {
  dark: { stroke: '#e0e0e0', fill: '#e0e0e0', menuBg: '#2a2a2a', menuBorder: '#555', menuHover: '#444', menuText: '#e0e0e0' },
  light: { stroke: '#333333', fill: '#333333', menuBg: '#f0f0f0', menuBorder: '#ccc', menuHover: '#ddd', menuText: '#333333' },
};

let current = 'dark';
const listeners = [];

export function getColor() { return themes[current].stroke; }
export function getFill() { return themes[current].fill; }
export function getMenu() { return themes[current]; }
export function getTheme() { return current; }

export function toggleTheme() {
  current = current === 'dark' ? 'light' : 'dark';
  listeners.forEach(fn => fn(current));
  try { localStorage.setItem('code-pet-theme', current); } catch {}
}

export function onThemeChange(fn) { listeners.push(fn); }

// Restore saved preference
try { const saved = localStorage.getItem('code-pet-theme'); if (saved) current = saved; } catch {}
