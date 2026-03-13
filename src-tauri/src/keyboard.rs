#[cfg(windows)]
use windows::Win32::Foundation::HWND;
#[cfg(windows)]
use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
#[cfg(windows)]
use windows::Win32::System::Threading::{
    OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
};
#[cfg(windows)]
use windows::Win32::UI::Input::KeyboardAndMouse::GetAsyncKeyState;
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowThreadProcessId,
};

use std::sync::{Arc, Mutex};
use std::time::Instant;
use tauri::{AppHandle, Emitter};

const TERMINAL_PROCESSES: &[&str] = &[
    "windowsterminal.exe",
    "cmd.exe",
    "powershell.exe",
    "pwsh.exe",
    "mintty.exe",
    "alacritty.exe",
    "wezterm-gui.exe",
];

const TYPING_DEBOUNCE_SECS: f64 = 2.0;

const MONITORED_KEYS: &[i32] = &[
    // A-Z
    0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A,
    0x4B, 0x4C, 0x4D, 0x4E, 0x4F, 0x50, 0x51, 0x52, 0x53, 0x54,
    0x55, 0x56, 0x57, 0x58, 0x59, 0x5A,
    // 0-9
    0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
    // Space, Enter, Backspace, Tab
    0x20, 0x0D, 0x08, 0x09,
    // Common punctuation (OEM keys)
    0xBA, 0xBB, 0xBC, 0xBD, 0xBE, 0xBF, 0xC0, 0xDB, 0xDC, 0xDD, 0xDE,
];

pub struct KeyboardWatcher {
    is_typing: Arc<Mutex<bool>>,
    last_key_time: Arc<Mutex<Instant>>,
}

impl KeyboardWatcher {
    pub fn new() -> Self {
        Self {
            is_typing: Arc::new(Mutex::new(false)),
            last_key_time: Arc::new(Mutex::new(Instant::now())),
        }
    }

    #[cfg(windows)]
    fn is_terminal_focused() -> bool {
        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd == HWND::default() {
                return false;
            }

            let mut pid: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            if pid == 0 {
                return false;
            }

            let process = OpenProcess(
                PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
                false,
                pid,
            );

            match process {
                Ok(handle) => {
                    let mut buf = [0u16; 260];
                    let len = GetModuleFileNameExW(Some(handle), None, &mut buf);
                    let _ = windows::Win32::Foundation::CloseHandle(handle);
                    if len == 0 {
                        return false;
                    }
                    let name = String::from_utf16_lossy(&buf[..len as usize]);
                    let exe_name = name
                        .rsplit('\\')
                        .next()
                        .unwrap_or("")
                        .to_lowercase();
                    TERMINAL_PROCESSES.contains(&exe_name.as_str())
                }
                Err(_) => false,
            }
        }
    }

    #[cfg(not(windows))]
    fn is_terminal_focused() -> bool {
        false
    }

    #[cfg(windows)]
    fn any_key_pressed() -> bool {
        unsafe {
            for &vk in MONITORED_KEYS {
                let state = GetAsyncKeyState(vk);
                if state & 1 != 0 {
                    return true;
                }
            }
            false
        }
    }

    #[cfg(not(windows))]
    fn any_key_pressed() -> bool {
        false
    }

    pub fn start_monitoring(&self, app: AppHandle) {
        let is_typing = self.is_typing.clone();
        let last_key_time = self.last_key_time.clone();

        std::thread::spawn(move || {
            loop {
                std::thread::sleep(std::time::Duration::from_millis(200));

                let terminal_focused = Self::is_terminal_focused();
                let key_pressed = terminal_focused && Self::any_key_pressed();

                if key_pressed {
                    *last_key_time.lock().unwrap() = Instant::now();
                }

                let elapsed = last_key_time.lock().unwrap().elapsed().as_secs_f64();
                let currently_typing = elapsed < TYPING_DEBOUNCE_SECS && terminal_focused;

                let mut was_typing = is_typing.lock().unwrap();
                if currently_typing != *was_typing {
                    *was_typing = currently_typing;
                    let _ = app.emit("user-typing-change", currently_typing);
                }
            }
        });
    }

    pub fn is_user_typing(&self) -> bool {
        *self.is_typing.lock().unwrap()
    }
}
