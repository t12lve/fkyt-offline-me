use tauri::Window;

#[tauri::command]
pub fn app_minimize(window: Window) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn app_toggle_maximize(window: Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
pub fn app_close(window: Window) {
    let _ = window.close();
}

#[tauri::command]
pub fn app_is_maximized(window: Window) -> bool {
    window.is_maximized().unwrap_or(false)
}
