use crate::engine::models::{PlaylistInfo, TrackItem};
use crate::utils::paths::sanitize_filename;
use serde_json::Value;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tokio::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Recherche le binaire yt-dlp :
/// 1. Sidecar Tauri (yt-dlp-x86_64-pc-windows-msvc.exe)
/// 2. Dossier local bin/yt-dlp.exe
/// 3. Dossier de l'exécutable
/// 4. PATH système
pub fn resolve_ytdlp_path(_app: Option<&AppHandle>) -> Option<PathBuf> {
    let candidates = [
        PathBuf::from("src-tauri/bin/yt-dlp-x86_64-pc-windows-msvc.exe"),
        PathBuf::from("src-tauri/bin/yt-dlp.exe"),
        PathBuf::from("bin/yt-dlp-x86_64-pc-windows-msvc.exe"),
        PathBuf::from("bin/yt-dlp.exe"),
        PathBuf::from("yt-dlp.exe"),
    ];

    for candidate in &candidates {
        if candidate.exists() {
            if let Ok(abs) = candidate.canonicalize() {
                return Some(abs);
            }
            return Some(candidate.clone());
        }
    }

    // Vérifier à côté de l'exécutable en cours
    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(parent) = current_exe.parent() {
            let exe_adjacent = parent.join("yt-dlp.exe");
            if exe_adjacent.exists() {
                return Some(exe_adjacent);
            }
            let sidecar_adjacent = parent.join("yt-dlp-x86_64-pc-windows-msvc.exe");
            if sidecar_adjacent.exists() {
                return Some(sidecar_adjacent);
            }
            let bin_sub = parent.join("bin").join("yt-dlp.exe");
            if bin_sub.exists() {
                return Some(bin_sub);
            }
        }
    }

    // Vérifier dans le PATH système
    if let Ok(path_var) = std::env::var("PATH") {
        for dir in std::env::split_paths(&path_var) {
            let p = dir.join("yt-dlp.exe");
            if p.exists() {
                return Some(p);
            }
        }
    }

    None
}

/// Analyse une URL avec yt-dlp sans télécharger le moindre flux audio
pub async fn inspect_url(
    ytdlp_bin: &Path,
    url: &str,
    root_destination: &Path,
) -> Result<PlaylistInfo, String> {
    let mut cmd = Command::new(ytdlp_bin);
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd.args(&[
        "--dump-single-json",
        "--flat-playlist",
        "--no-warnings",
        "--skip-download",
        url,
    ]);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Impossible d'exécuter yt-dlp : {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp a renvoyé une erreur : {}", stderr));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let parsed: Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Erreur lors du décodage JSON de la playlist : {}", e))?;

    let is_playlist = parsed.get("_type").and_then(|t| t.as_str()) == Some("playlist")
        || parsed.get("entries").is_some();

    let title = parsed
        .get("title")
        .and_then(|t| t.as_str())
        .unwrap_or("Playlist Inconnue")
        .to_string();

    let uploader = parsed
        .get("uploader")
        .or_else(|| parsed.get("channel"))
        .and_then(|u| u.as_str())
        .map(|s| s.to_string());

    let thumbnail = parsed
        .get("thumbnails")
        .and_then(|th| th.as_array())
        .and_then(|arr| arr.last())
        .and_then(|last| last.get("url"))
        .and_then(|u| u.as_str())
        .or_else(|| parsed.get("thumbnail").and_then(|u| u.as_str()))
        .map(|s| s.to_string());

    let sanitized_title = sanitize_filename(&title);
    let output_folder = root_destination.join(&sanitized_title);

    let mut entries = Vec::new();

    if is_playlist {
        if let Some(raw_entries) = parsed.get("entries").and_then(|e| e.as_array()) {
            for (idx, entry) in raw_entries.iter().enumerate() {
                let id = entry
                    .get("id")
                    .and_then(|i| i.as_str())
                    .unwrap_or(&format!("track_{}", idx))
                    .to_string();

                let track_title = entry
                    .get("title")
                    .and_then(|t| t.as_str())
                    .unwrap_or(&format!("Titre {}", idx + 1))
                    .to_string();

                let track_url = entry
                    .get("url")
                    .and_then(|u| u.as_str())
                    .map(|s| {
                        if s.starts_with("http") {
                            s.to_string()
                        } else {
                            format!("https://www.youtube.com/watch?v={}", s)
                        }
                    })
                    .or_else(|| Some(format!("https://www.youtube.com/watch?v={}", id)));

                let track_uploader = entry
                    .get("uploader")
                    .or_else(|| entry.get("channel"))
                    .and_then(|u| u.as_str())
                    .map(|s| s.to_string())
                    .or_else(|| uploader.clone());

                let duration = entry
                    .get("duration")
                    .and_then(|d| d.as_f64());

                entries.push(TrackItem {
                    id,
                    title: track_title,
                    url: track_url,
                    uploader: track_uploader,
                    duration,
                    status: "Pending".to_string(),
                    progress: Some(0.0),
                    speed: None,
                    error_message: None,
                });
            }
        }
    } else {
        // Piste unique
        let id = parsed
            .get("id")
            .and_then(|i| i.as_str())
            .unwrap_or("track_1")
            .to_string();

        let duration = parsed.get("duration").and_then(|d| d.as_f64());

        entries.push(TrackItem {
            id,
            title: title.clone(),
            url: Some(url.to_string()),
            uploader: uploader.clone(),
            duration,
            status: "Pending".to_string(),
            progress: Some(0.0),
            speed: None,
            error_message: None,
        });
    }

    Ok(PlaylistInfo {
        id: parsed.get("id").and_then(|i| i.as_str()).map(|s| s.to_string()),
        title,
        uploader,
        thumbnail,
        output_folder: output_folder.to_string_lossy().to_string(),
        entries,
    })
}
