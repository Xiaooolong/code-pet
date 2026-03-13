mod keyboard;
mod status;

use keyboard::KeyboardWatcher;
use status::StatusWatcher;
use std::sync::Arc;
use tauri::Manager;

#[tauri::command]
fn get_state(watcher: tauri::State<'_, Arc<StatusWatcher>>) -> String {
    watcher.get_current_state()
}

#[tauri::command]
fn is_typing(kb: tauri::State<'_, Arc<KeyboardWatcher>>) -> bool {
    kb.is_user_typing()
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let watcher = Arc::new(StatusWatcher::new());
    let kb_watcher = Arc::new(KeyboardWatcher::new());

    tauri::Builder::default()
        .manage(watcher.clone())
        .manage(kb_watcher.clone())
        .invoke_handler(tauri::generate_handler![get_state, is_typing, quit_app])
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Ensure ~/.claude-pet/ exists
            let pet_dir = dirs::home_dir()
                .expect("Cannot find home directory")
                .join(".claude-pet");
            if !pet_dir.exists() {
                std::fs::create_dir_all(&pet_dir).ok();
            }

            // Position window to bottom-right corner
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let scale = monitor.scale_factor();
                    let win_size = window.outer_size().unwrap_or_default();

                    let x = (screen_size.width as f64 / scale) as i32
                        - (win_size.width as f64 / scale) as i32
                        - 20;
                    let y = (screen_size.height as f64 / scale) as i32
                        - (win_size.height as f64 / scale) as i32
                        - 60;

                    let _ = window.set_position(tauri::LogicalPosition::new(x, y));
                }
            }

            watcher.start_polling(app.handle().clone());
            kb_watcher.start_monitoring(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
