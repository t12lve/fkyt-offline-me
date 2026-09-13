use std::path::PathBuf;
use tauri::AppHandle;

/// Recherche le binaire ffmpeg :
/// 1. Sidecar Tauri (ffmpeg-x86_64-pc-windows-msvc.exe)
/// 2. Dossier local bin/ffmpeg.exe
/// 3. Dossier de l'exécutable
/// 4. PATH système
pub fn resolve_ffmpeg_path(_app: Option<&AppHandle>) -> Option<PathBuf> {
    // 1. Vérifier si un binaire ffmpeg existe dans le répertoire de travail / bin
    let candidates = [
        PathBuf::from("src-tauri/bin/ffmpeg-x86_64-pc-windows-msvc.exe"),
        PathBuf::from("src-tauri/bin/ffmpeg.exe"),
        PathBuf::from("bin/ffmpeg-x86_64-pc-windows-msvc.exe"),
        PathBuf::from("bin/ffmpeg.exe"),
        PathBuf::from("ffmpeg.exe"),
    ];

    for candidate in &candidates {
        if candidate.exists() {
            if let Ok(abs) = candidate.canonicalize() {
                return Some(abs);
            }
            return Some(candidate.clone());
        }
    }

    // 2. Vérifier à côté de l'exécutable en cours
    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(parent) = current_exe.parent() {
            let exe_adjacent = parent.join("ffmpeg.exe");
            if exe_adjacent.exists() {
                return Some(exe_adjacent);
            }
            let sidecar_adjacent = parent.join("ffmpeg-x86_64-pc-windows-msvc.exe");
            if sidecar_adjacent.exists() {
                return Some(sidecar_adjacent);
            }
            let bin_sub = parent.join("bin").join("ffmpeg.exe");
            if bin_sub.exists() {
                return Some(bin_sub);
            }
        }
    }

    // 3. Vérifier dans le PATH système
    if let Ok(path_var) = std::env::var("PATH") {
        for dir in std::env::split_paths(&path_var) {
            let p = dir.join("ffmpeg.exe");
            if p.exists() {
                return Some(p);
            }
        }
    }

    None
}
