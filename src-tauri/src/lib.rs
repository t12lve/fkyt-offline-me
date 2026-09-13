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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let res = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(DownloadState::default())
        .manage(ConverterState::default())
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
