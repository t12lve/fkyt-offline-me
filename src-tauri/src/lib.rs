pub mod commands;
pub mod engine;
pub mod utils;

use commands::binaries::check_binaries;
use commands::converter::{
    cancel_compression, convert_local_audio_files, pick_audio_files, scan_local_audio,
    ConverterState,
};
use commands::download::{cancel_download, inspect_playlist, start_download, DownloadState};
use commands::hardware::get_system_specs;
use commands::system::{get_default_music_dir, open_folder, select_folder};
use commands::window::{app_close, app_is_maximized, app_minimize, app_toggle_maximize};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let res = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(DownloadState::default())
        .manage(ConverterState::default())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let p_size = monitor.size();
                    let scale = monitor.scale_factor();
                    let log_w = p_size.width as f64 / scale;
                    let log_h = p_size.height as f64 / scale;

                    // Adaptation intelligente de la taille selon l'écran détecté
                    // 4K (>= 3400px physiques) -> affichage spacieux 1440p (2400x1400)
                    // 1440p (>= 2400px physiques) -> fenêtre 1840x1120
                    // 1080p (>= 1800px physiques) -> fenêtre 1600x980
                    let (target_w, target_h) = if p_size.width >= 3400 || log_w >= 2400.0 {
                        (2400.0, 1400.0)
                    } else if p_size.width >= 2400 || log_w >= 1800.0 {
                        (1840.0, 1120.0)
                    } else if p_size.width >= 1800 || log_w >= 1500.0 {
                        (1600.0, 980.0)
                    } else {
                        ((log_w * 0.92).max(1100.0), (log_h * 0.90).max(720.0))
                    };

                    let final_w = target_w.min(log_w * 0.96);
                    let final_h = target_h.min(log_h * 0.94);

                    let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                        width: final_w,
                        height: final_h,
                    }));
                    let _ = window.center();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_binaries,
            get_default_music_dir,
            select_folder,
            open_folder,
            inspect_playlist,
            start_download,
            cancel_download,
            pick_audio_files,
            scan_local_audio,
            convert_local_audio_files,
            cancel_compression,
            get_system_specs,
            app_minimize,
            app_toggle_maximize,
            app_close,
            app_is_maximized,
        ])
        .run(tauri::generate_context!());

    if let Err(e) = res {
        let msg = format!("Erreur lors du lancement de l'application fkYT offline me: {:?}\n", e);
        eprintln!("{}", msg);
        let _ = std::fs::write("crash.log", msg);
        panic!("Erreur fatale: {:?}", e);
    }
}
