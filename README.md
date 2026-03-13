# Code Pet

A desktop pet that reacts to [Claude Code](https://docs.anthropic.com/en/docs/claude-code) in real time.

A hand-drawn stick figure lives in a transparent always-on-top window and animates based on what Claude is doing — thinking, writing code, reading files, running commands, and more.

[![English](https://img.shields.io/badge/lang-English-blue)](./README.md) [![中文](https://img.shields.io/badge/lang-中文-red)](./README.zh-CN.md)

![demo](./assets/demo.gif)

## How It Works

[Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) fire on events (`PreToolUse`, `UserPromptSubmit`, etc.) → hook script writes state to `~/.claude-pet/status.json` → Tauri backend polls the file → SVG frontend animates.

| State | Trigger | Animation |
|-------|---------|-----------|
| idle | Claude idle | Sipping tea, steam rising |
| thinking | User sends message | Scratching head, `?` `!` floating |
| coding | Edit / Write | Typing on keyboard, `</>` `{ }` floating |
| reading | Read / Glob / Grep | Holding a book, `wow` `aha` floating |
| running | Bash | Running in place, sweat drops |
| celebrate | Task completed | Jumping, sparkle stars + confetti |
| error | Tool failed | Shaking, explosion + smoke |
| user_typing | Keyboard input | Catching falling characters |

## Quick Start

**Prerequisites:** Windows 10/11, [Rust](https://rustup.rs/), [Tauri v2 CLI](https://v2.tauri.app/start/prerequisites/), [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

```bash
# Build & run
cd code-pet
cargo tauri dev

# Install hooks
powershell.exe -ExecutionPolicy Bypass -File scripts/install-hooks.ps1

# Restart Claude Code — done!
```

## Interaction

- **Drag** — move the pet around
- **Click** — triggers a reaction
- **Right-click** — Theme / Speed / Size / Reset Position / Quit

## Uninstall

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/uninstall-hooks.ps1
```

## Tech Stack

**Tauri v2** (transparent window) + **SVG** (procedural animation, zero assets) + **Claude Code Hooks** (event-driven state)

## License

[MIT](./LICENSE)
