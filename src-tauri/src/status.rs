use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PetStatus {
    pub state: String,
    pub timestamp: u64,
}

impl Default for PetStatus {
    fn default() -> Self {
        Self {
            state: "idle".to_string(),
            timestamp: 0,
        }
    }
}

pub struct StatusWatcher {
    last_status: Arc<Mutex<PetStatus>>,
}

impl StatusWatcher {
    pub fn new() -> Self {
        Self {
            last_status: Arc::new(Mutex::new(PetStatus::default())),
        }
    }

    fn status_file_path() -> PathBuf {
        dirs::home_dir()
            .expect("Cannot find home directory")
            .join(".claude-pet")
            .join("status.json")
    }

    fn read_status() -> Option<PetStatus> {
        let path = Self::status_file_path();
        let content = fs::read_to_string(&path).ok()?;
        // Strip UTF-8 BOM if present (PowerShell 5.1 may write BOM)
        let content = content.strip_prefix('\u{feff}').unwrap_or(&content);
        serde_json::from_str(content).ok()
    }

    pub fn start_polling(&self, app: AppHandle) {
        let last_status = self.last_status.clone();
        let idle_timeout_secs = 30u64;

        std::thread::spawn(move || {
            loop {
                std::thread::sleep(std::time::Duration::from_millis(500));

                let mut current = Self::read_status().unwrap_or_default();

                // Check for idle timeout
                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs();
                if current.timestamp > 0
                    && now - current.timestamp > idle_timeout_secs
                    && current.state != "idle"
                {
                    current.state = "idle".to_string();
                }

                let mut last = last_status.lock().unwrap();
                if current.state != last.state {
                    let _ = app.emit("pet-state-change", &current.state);
                    *last = current;
                }
            }
        });
    }

    pub fn get_current_state(&self) -> String {
        self.last_status.lock().unwrap().state.clone()
    }
}
