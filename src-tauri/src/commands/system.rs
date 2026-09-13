use crate::utils::paths::ensure_dir_exists;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// Récupère le dossier de téléchargement par défaut (~/Music/fkYT offline me/)
#[tauri::command]
pub fn get_default_music_dir() -> Result<String, String> {
    let base_music = dirs::audio_dir()
        .or_else(|| dirs::download_dir())
        .or_else(|| dirs::home_dir())
        .unwrap_or_else(|| PathBuf::from("C:\\"));

    let target_dir = base_music.join("fkYT offline me");
    let ensured = ensure_dir_exists(&target_dir)?;
    Ok(ensured.to_string_lossy().to_string())
}

/// Boîte de dialogue native Windows pour choisir un dossier racine
#[tauri::command]
pub async fn select_folder(app: AppHandle) -> Result<Option<String>, String> {
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}

/// Ouvre le dossier spécifié directement dans l'Explorateur Windows
#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        // Si le sous-dossier n'existe pas encore, on le crée
        let _ = ensure_dir_exists(&p);
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Impossible d'ouvrir l'explorateur : {}", e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        open::that(&path).map_err(|e| format!("Impossible d'ouvrir le dossier : {}", e))?;
    }

    Ok(())
}
