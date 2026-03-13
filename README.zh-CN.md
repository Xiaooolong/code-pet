# Claude Pet

一个跟随 Claude Code 工作状态实时变化的桌面宠物。手绘涂鸦风格的火柴小人会根据 Claude 当前在做什么（思考、写代码、读文件、跑命令……）做出不同的动画反应。

## 效果预览

| 状态 | 触发条件 | 小人表现 |
|------|---------|---------|
| idle | Claude 空闲 / 停止 | 打瞌睡，头顶飘出手绘 Zzz |
| thinking | 用户发送消息 | 歪头挠脑袋，头顶一团乱麻 + 飘出 `?` `!` |
| coding | Edit / Write 工具 | 疯狂敲键盘，屏幕闪烁代码行，飘出 `</>` `{ }` `=>` |
| reading | Read / Glob / Grep 工具 | 捧书阅读，飘出 `wow` `aha` `cool` 等单词 |
| running | Bash 工具 | 原地跑步，头顶冒汗 |
| celebrate | 任务完成 | 蹦跳欢呼，星星闪烁 + 纸片飘落 |
| error | 工具执行失败 | 抖动崩溃，头顶循环爆炸 + 冒烟 |
| user_typing | 检测到终端键盘输入 | 拿铅笔在本子上写字 |

## 技术栈

- **Tauri v2** — 透明无边框桌面窗口
- **SVG** — 纯手绘风格矢量动画，无外部资源
- **Claude Code Hooks** — 通过 hook 事件驱动状态切换
- **Win32 API** — 检测终端键盘输入（user_typing 状态）
- **PowerShell** — hook 脚本写入状态文件

## 架构

```
┌─────────────────┐     hook events      ┌──────────────────┐
│   Claude Code   │ ──────────────────>   │  PowerShell Hook │
└─────────────────┘                       └────────┬─────────┘
                                                   │ writes JSON
                                                   v
                                          ~/.claude-pet/status.json
                                                   ^
                                                   │ polls 500ms
┌─────────────────┐     Tauri events      ┌────────┴─────────┐
│   SVG Renderer  │ <──────────────────   │   Rust Backend   │
│  (renderer.js)  │                       │  (status.rs +    │
│  (decorations.js)                       │   keyboard.rs)   │
└─────────────────┘                       └──────────────────┘
```

### 前端

| 文件 | 职责 |
|------|------|
| `src/renderer.js` | 8 种姿态的 SVG 渲染：头部、眼睛、嘴巴、腮红、身体、四肢 |
| `src/decorations.js` | 每种状态的装饰粒子效果（飘字、星星、烟雾等） |
| `src/app.js` | 状态机、动画循环、拖拽、右键菜单、缩放 |
| `src/style.css` | 透明背景 + 过渡动画 |
| `src/debug.html` | 调试面板，可同时预览所有状态动画 |

### 后端 (Rust)

| 文件 | 职责 |
|------|------|
| `src-tauri/src/lib.rs` | Tauri 应用入口，窗口初始化，右下角定位 |
| `src-tauri/src/status.rs` | 轮询 `~/.claude-pet/status.json`，30 秒无更新回退 idle |
| `src-tauri/src/keyboard.rs` | Win32 API 检测终端进程键盘输入，2 秒去抖 |

### Hook 脚本

| 文件 | 职责 |
|------|------|
| `hooks/claude-pet-hook.ps1` | 接收状态参数，原子写入 JSON 文件 |
| `scripts/install-hooks.ps1` | 将 hook 注册到 `~/.claude/settings.json` |
| `scripts/uninstall-hooks.ps1` | 移除 hook 注册 |

## 安装

### 前置要求

- Windows 10/11
- [Rust](https://rustup.rs/) + cargo
- [Tauri v2 CLI](https://v2.tauri.app/start/prerequisites/)
- Claude Code

### 步骤

1. **编译运行**

```bash
cd claude-pet
cargo tauri dev      # 开发模式
cargo tauri build    # 生产构建
```

2. **安装 hooks**

```powershell
cd claude-pet
powershell.exe -ExecutionPolicy Bypass -File scripts/install-hooks.ps1
```

3. **重启 Claude Code**，hook 即生效

### 卸载 hooks

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/uninstall-hooks.ps1
```

## 交互

- **拖拽** — 按住鼠标左键拖动小人
- **点击** — 小人会做出临时反应（idle 点击会庆祝，error 点击会开始思考等）
- **右键菜单** — Reset Position / 切换大小 (S/M/L) / 退出

## 调试

用任意 HTTP 服务器打开 `src/debug.html` 即可预览所有动画状态：

```bash
cd claude-pet/src
python -m http.server 8080
# 浏览器打开 http://localhost:8080/debug.html
```

手动触发状态切换（无需 Claude Code 运行）：

```powershell
powershell.exe -ExecutionPolicy Bypass -File hooks/claude-pet-hook.ps1 thinking
```

## Hook 事件映射

| Claude Code 事件 | 触发状态 |
|------------------|---------|
| `UserPromptSubmit` | thinking |
| `PreToolUse` (Edit/Write) | coding |
| `PreToolUse` (Read/Glob/Grep) | reading |
| `PreToolUse` (Bash) | running |
| `PostToolUseFailure` | error |
| `TaskCompleted` | celebrate |
| `Stop` | idle |
| 终端键盘输入检测 | user_typing |
