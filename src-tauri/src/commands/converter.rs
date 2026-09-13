use crate::engine::ffmpeg::resolve_ffmpeg_path;
use crate::utils::paths::ensure_dir_exists;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_dialog::DialogExt;
use tokio::process::Command;
use tokio::sync::{Mutex, Semaphore};

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalAudioFile {
    pub path: String,
    pub filename: String,
    pub folder_name: String,
    pub original_size_bytes: u64,
    pub status: String, // "Pending", "Converting", "Completed", "Error"
    pub final_size_bytes: Option<u64>,
    pub output_file_path: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressProgress {
    pub completed_files: usize,
    pub total_files: usize,
    pub current_filename: Option<String>,
    pub total_original_bytes: u64,
    pub total_final_bytes: u64,
}

pub struct ConverterState {
    pub is_cancelled: Arc<AtomicBool>,
}

impl Default for ConverterState {
    fn default() -> Self {
        Self {
            is_cancelled: Arc::new(AtomicBool::new(false)),
        }
    }
}

const AUDIO_EXTENSIONS: &[&str] = &[
    "mp3", "wav", "flac", "m4a", "aac", "ogg", "opus", "wma", "aiff"
];

fn is_audio_file(path: &Path) -> bool {
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        AUDIO_EXTENSIONS.iter().any(|&ae| ae.eq_ignore_ascii_case(ext))
    } else {
        false
    }
}

/// Boîte de dialogue pour sélectionner un ou plusieurs fichiers audio
#[tauri::command]
pub async fn pick_audio_files(app: AppHandle) -> Result<Vec<String>, String> {
    let files = app
        .dialog()
        .file()
        .add_filter("Fichiers Audio", AUDIO_EXTENSIONS)
        .blocking_pick_files();

    match files {
        Some(list) => Ok(list.into_iter().map(|f| f.to_string()).collect()),
        None => Ok(Vec::new()),
    }
}

/// Scanne des chemins (fichiers individuels ou répertoires complets)
#[tauri::command]
pub fn scan_local_audio(paths: Vec<String>) -> Result<Vec<LocalAudioFile>, String> {
    let mut results = Vec::new();

    for path_str in paths {
        let p = PathBuf::from(&path_str);
        if p.is_file() {
            if is_audio_file(&p) {
                if let Ok(meta) = std::fs::metadata(&p) {
                    let filename = p.file_name().unwrap_or_default().to_string_lossy().to_string();
                    let folder_name = p
                        .parent()
                        .and_then(|pr| pr.file_name())
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();

                    results.push(LocalAudioFile {
                        path: path_str,
                        filename,
                        folder_name: if folder_name.is_empty() { "Fichiers_Isolés".to_string() } else { folder_name },
                        original_size_bytes: meta.len(),
                        status: "Pending".to_string(),
                        final_size_bytes: None,
                        output_file_path: None,
                        error_message: None,
                    });
                }
            }
        } else if p.is_dir() {
            let mut stack = vec![p];
            while let Some(current_dir) = stack.pop() {
                if let Ok(entries) = std::fs::read_dir(&current_dir) {
                    for entry in entries.flatten() {
                        let entry_path = entry.path();
                        if entry_path.is_dir() {
                            stack.push(entry_path);
                        } else if entry_path.is_file() && is_audio_file(&entry_path) {
                            if let Ok(meta) = std::fs::metadata(&entry_path) {
                                let filename = entry_path
                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .to_string();
                                let folder_name = entry_path
                                    .parent()
                                    .and_then(|pr| pr.file_name())
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .to_string();

                                results.push(LocalAudioFile {
                                    path: entry_path.to_string_lossy().to_string(),
                                    filename,
                                    folder_name: if folder_name.is_empty() { "Dossier_Principal".to_string() } else { folder_name },
                                    original_size_bytes: meta.len(),
                                    status: "Pending".to_string(),
                                    final_size_bytes: None,
                                    output_file_path: None,
                                    error_message: None,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(results)
}

/// Convertit et compresse par lot les fichiers audio en créant un dossier dédié par album/dossier source
#[tauri::command]
pub async fn convert_local_audio_files(
    app: AppHandle,
    state: State<'_, ConverterState>,
    files: Vec<LocalAudioFile>,
    target_bitrate: String,
    custom_output_dir: Option<String>,
    threads_count: Option<usize>,
) -> Result<(), String> {
    let ffmpeg_bin = resolve_ffmpeg_path(Some(&app))
        .ok_or_else(|| "Binaire ffmpeg introuvable pour la conversion locale.".to_string())?;

    state.is_cancelled.store(false, Ordering::SeqCst);
    let is_cancelled = state.is_cancelled.clone();

    let total_files = files.len();
    let total_orig_bytes: u64 = files.iter().map(|f| f.original_size_bytes).sum();
    let completed_counter = Arc::new(Mutex::new(0usize));
    let total_final_counter = Arc::new(Mutex::new(0u64));
    let created_folders = Arc::new(Mutex::new(HashSet::new()));
    
    // Initialisation dynamique du pool de conversion ffmpeg (défaut: 4, max: 16)
    let worker_limit = threads_count.unwrap_or(4).clamp(1, 16);
    let semaphore = Arc::new(Semaphore::new(worker_limit));

    let app_handle = app.clone();
    let ffmpeg_path = ffmpeg_bin.clone();
    let bitrate_clean = target_bitrate.clone();
    let custom_root = custom_output_dir.clone();

    tokio::spawn(async move {
        let mut tasks = Vec::new();

        for file in files {
            if is_cancelled.load(Ordering::SeqCst) {
                break;
            }

            let sem = semaphore.clone();
            let app = app_handle.clone();
            let ffmpeg = ffmpeg_path.clone();
            let bitrate = bitrate_clean.clone();
            let completed = completed_counter.clone();
            let final_bytes = total_final_counter.clone();
            let folders_set = created_folders.clone();
            let is_canc = is_cancelled.clone();
            let custom_dir = custom_root.clone();

            let task = tokio::spawn(async move {
                let _permit = match sem.acquire().await {
                    Ok(p) => p,
                    Err(_) => return,
                };

                if is_canc.load(Ordering::SeqCst) {
                    return;
                }

                let input_path = PathBuf::from(&file.path);
                let stem = input_path.file_stem().unwrap_or_default().to_string_lossy();

                // DÉTERMINATION DU DOSSIER DÉDIÉ PAR DOSSIER SOURCE (ZÉRO MÉLANGE) :
                // Si un dossier de destination personnalisé est spécifié :
                //   <custom_output_dir>/<file.folder_name> (<bitrate>)/<file>.mp3
                // Si aucun dossier n'est spécifié :
                //   <parent_folder>/_reduit_<bitrate>/<file>.mp3
                let target_folder = if let Some(ref custom) = custom_dir.filter(|c| !c.is_empty()) {
                    let base = PathBuf::from(custom);
                    base.join(format!("{} ({})", file.folder_name, bitrate))
                } else {
                    let parent = input_path.parent().unwrap_or_else(|| Path::new("."));
                    parent.join(format!("_reduit_{}", bitrate))
                };

                let _ = ensure_dir_exists(&target_folder);
                {
                    let mut fset = folders_set.lock().await;
                    fset.insert(target_folder.to_string_lossy().to_string());
                }

                let output_file_path = target_folder.join(format!("{}.mp3", stem));

                let mut updated_file = file.clone();
                updated_file.status = "Converting".to_string();
                let _ = app.emit("compress-file-update", &updated_file);

                // Conversion ffmpeg avec préservation des métadonnées
                let mut cmd = Command::new(&ffmpeg);
                cmd.creation_flags(CREATE_NO_WINDOW);
                cmd.args(&[
                    "-y",
                    "-i",
                    &file.path,
                    "-vn",
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    &bitrate,
                    "-map_metadata",
                    "0",
                    "-id3v2_version",
                    "3",
                    &output_file_path.to_string_lossy(),
                ]);

                let output_res = cmd.output().await;

                match output_res {
                    Ok(res) if res.status.success() && output_file_path.exists() => {
                        let final_size = std::fs::metadata(&output_file_path)
                            .map(|m| m.len())
                            .unwrap_or(0);

                        updated_file.status = "Completed".to_string();
                        updated_file.final_size_bytes = Some(final_size);
                        updated_file.output_file_path = Some(output_file_path.to_string_lossy().to_string());
                        let _ = app.emit("compress-file-update", &updated_file);

                        let mut comp = completed.lock().await;
                        *comp += 1;
                        let count = *comp;

                        let mut fb = final_bytes.lock().await;
                        *fb += final_size;
                        let tot_final = *fb;

                        let _ = app.emit(
                            "compress-progress",
                            CompressProgress {
                                completed_files: count,
                                total_files,
                                current_filename: Some(file.filename.clone()),
                                total_original_bytes: total_orig_bytes,
                                total_final_bytes: tot_final,
                            },
                        );
                    }
                    _ => {
                        updated_file.status = "Error".to_string();
                        updated_file.error_message = Some("Erreur lors de l'encodage ffmpeg".to_string());
                        let _ = app.emit("compress-file-update", &updated_file);
                    }
                }
            });

            tasks.push(task);
        }

        for task in tasks {
            let _ = task.await;
        }

        let total_final = *total_final_counter.lock().await;
        let created: Vec<String> = created_folders.lock().await.iter().cloned().collect();

        let _ = app_handle.emit(
            "compress-finished",
            serde_json::json!({
                "success": true,
                "created_folders": created,
                "first_output_folder": created.first().cloned().unwrap_or_default(),
                "total_original_bytes": total_orig_bytes,
                "total_final_bytes": total_final,
                "saved_bytes": if total_orig_bytes > total_final { total_orig_bytes - total_final } else { 0 }
            }),
        );
    });

    Ok(())
}

/// Annule la compression locale
#[tauri::command]
pub fn cancel_compression(state: State<'_, ConverterState>) -> Result<(), String> {
    state.is_cancelled.store(true, Ordering::SeqCst);
    Ok(())
}
