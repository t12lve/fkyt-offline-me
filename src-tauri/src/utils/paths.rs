use regex::Regex;
use std::path::{Path, PathBuf};

/// Nettoie un nom de dossier ou de fichier pour être valide sous Windows
pub fn sanitize_filename(name: &str) -> String {
    let re = Regex::new(r#"[<>:"/\\|?*]"#).unwrap();
    let sanitized = re.replace_all(name, "_").trim().to_string();
    if sanitized.is_empty() {
        "Unknown_Playlist".to_string()
    } else {
        sanitized
    }
}

/// S'assure qu'un répertoire existe, le crée si nécessaire
pub fn ensure_dir_exists<P: AsRef<Path>>(path: P) -> Result<PathBuf, String> {
    let p = path.as_ref();
    if !p.exists() {
        std::fs::create_dir_all(p)
            .map_err(|e| format!("Impossible de créer le dossier {:?}: {}", p, e))?;
    }
    Ok(p.to_path_buf())
}
