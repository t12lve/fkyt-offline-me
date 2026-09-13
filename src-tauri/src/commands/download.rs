use crate::engine::ffmpeg::resolve_ffmpeg_path;
use crate::engine::models::{GlobalProgress, LogLine, PlaylistInfo, TrackItem};
use crate::engine::ytdlp::{inspect_url, resolve_ytdlp_path};
use crate::utils::paths::{ensure_dir_exists, sanitize_filename};
use chrono::Local;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::{Mutex, Semaphore};

const CREATE_NO_WINDOW: u32 = 0x08000000;

pub struct DownloadState {
    pub is_cancelled: Arc<AtomicBool>,
}

impl Default for DownloadState {
    fn default() -> Self {
        Self {
            is_cancelled: Arc::new(AtomicBool::new(false)),
        }
    }
}

fn emit_log(app: &AppHandle, level: &str, message: &str) {
    let now = Local::now().format("%H:%M:%S").to_string();
    let _ = app.emit(
        "download-log",
        LogLine {
            timestamp: now,
            level: level.to_string(),
            message: message.to_string(),
        },
    );
}

/// Analyse l'URL et prépare le dossier de la playlist
#[tauri::command]
pub async fn inspect_playlist(
    app: AppHandle,
    url: String,
    destination_dir: String,
) -> Result<PlaylistInfo, String> {
    let ytdlp_bin = resolve_ytdlp_path(Some(&app))
        .ok_or_else(|| "Binaire yt-dlp introuvable. Exécutez le script scripts/setup-binaries.ps1 ou placez yt-dlp.exe dans bin/.".to_string())?;

    let root_path = PathBuf::from(&destination_dir);
    ensure_dir_exists(&root_path)?;

    emit_log(&app, "ytdlp", &format!("Analyse de la playlist via {:?}", ytdlp_bin));

    let info = inspect_url(&ytdlp_bin, &url, &root_path).await?;
    
    // Créer immédiatement le sous-dossier avec le nom de la playlist
    let playlist_subfolder = PathBuf::from(&info.output_folder);
    ensure_dir_exists(&playlist_subfolder)?;

    emit_log(
        &app,
        "success",
        &format!(
            "Dossier playlist créé : \"{}\" ({} pistes trouvées)",
            playlist_subfolder.display(),
            info.entries.len()
        ),
    );

    Ok(info)
}

/// Démarre le téléchargement multi-thread avec conversion MP3 320kbps
#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    state: State<'_, DownloadState>,
    _url: String,
    destination_dir: String,
    playlist_title: String,
    tracks: Vec<TrackItem>,
    audio_quality: Option<String>,
    threads_count: Option<usize>,
) -> Result<(), String> {
    let ytdlp_bin = resolve_ytdlp_path(Some(&app))
        .ok_or_else(|| "Binaire yt-dlp introuvable.".to_string())?;
    let ffmpeg_bin = resolve_ffmpeg_path(Some(&app))
        .ok_or_else(|| "Binaire ffmpeg introuvable. Nécessaire pour la conversion MP3 320k et l'injection des tags ID3.".to_string())?;

    state.is_cancelled.store(false, Ordering::SeqCst);
    let is_cancelled = state.is_cancelled.clone();

    let sanitized_title = sanitize_filename(&playlist_title);
    let output_folder = PathBuf::from(&destination_dir).join(&sanitized_title);
    ensure_dir_exists(&output_folder)?;

    let total_tracks = tracks.len();
    let completed_counter = Arc::new(Mutex::new(0usize));
    
    // Initialisation dynamique du pool selon les threads choisis (défaut: 2, max: 8)
    let worker_limit = threads_count.unwrap_or(2).clamp(1, 8);
    let semaphore = Arc::new(Semaphore::new(worker_limit));

    emit_log(
        &app,
        "info",
        &format!(
            "Lancement du pool d'extraction ({} threads) vers : {}",
            worker_limit,
            output_folder.display()
        ),
    );

    let bitrate_arg = match audio_quality.as_deref() {
        Some("V0") => "0".to_string(),
        Some(q) if !q.is_empty() => q.to_string(),
        _ => "320k".to_string(),
    };

    let app_handle = app.clone();
    let ytdlp_bin_path = ytdlp_bin.clone();
    let ffmpeg_bin_path = ffmpeg_bin.clone();
    let output_folder_str = output_folder.to_string_lossy().to_string();
    let selected_bitrate = bitrate_arg.clone();

    tokio::spawn(async move {
        let mut tasks = Vec::new();

        for track in tracks {
            if is_cancelled.load(Ordering::SeqCst) {
                break;
            }

            let sem = semaphore.clone();
            let app = app_handle.clone();
            let ytdlp = ytdlp_bin_path.clone();
            let ffmpeg = ffmpeg_bin_path.clone();
            let out_folder = output_folder_str.clone();
            let album_name = playlist_title.clone();
            let completed = completed_counter.clone();
            let is_canc = is_cancelled.clone();
            let quality = selected_bitrate.clone();

            let task = tokio::spawn(async move {
                let _permit = match sem.acquire().await {
                    Ok(p) => p,
                    Err(_) => return,
                };

                if is_canc.load(Ordering::SeqCst) {
                    return;
                }

                let track_id = track.id.clone();
                let track_url = track.url.unwrap_or_else(|| format!("https://www.youtube.com/watch?v={}", track_id));
                let ffmpeg_dir = ffmpeg.parent().unwrap_or(Path::new(""));

                // 3 Stratégies de téléchargement en cascade
                struct Strategy {
                    name: &'static str,
                    extractor_client: Option<&'static str>,
                    format_spec: Option<&'static str>,
                    embed_thumbnail: bool,
                    extra_flags: Vec<&'static str>,
                }

                let strategies = [
                    Strategy {
                        name: "Standard (Haute fidélité)",
                        extractor_client: None,
                        format_spec: None,
                        embed_thumbnail: true,
                        extra_flags: vec![],
                    },
                    Strategy {
                        name: "Client Android & Format ba/b",
                        extractor_client: Some("youtube:player_client=android,web"),
                        format_spec: Some("ba/b"),
                        embed_thumbnail: true,
                        extra_flags: vec!["--user-agent", "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"],
                    },
                    Strategy {
                        name: "Haute Résilience (Flux direct sans cover)",
                        extractor_client: Some("youtube:player_client=ios,android"),
                        format_spec: Some("bestaudio/best"),
                        embed_thumbnail: false, // Évite les crashs de conversion ID3 WebP/AVIF mutagen/ffmpeg
                        extra_flags: vec!["--no-check-certificates", "--prefer-free-formats", "--retries", "5"],
                    },
                ];

                let mut succeeded = false;
                let mut last_error = String::from("Erreur inconnue");

                for (attempt_idx, strat) in strategies.iter().enumerate() {
                    if is_canc.load(Ordering::SeqCst) {
                        break;
                    }

                    if attempt_idx > 0 {
                        let status_tag = if attempt_idx == 1 {
                            "Tentative 2 (Android)..."
                        } else {
                            "Tentative 3 (Résilience)..."
                        };

                        let _ = app.emit(
                            "track-status",
                            serde_json::json!({
                                "id": track_id,
                                "status": status_tag,
                                "progress": 5.0,
                                "speed": ""
                            }),
                        );

                        emit_log(
                            &app,
                            "warn",
                            &format!(
                                "⚠️ [Tentative {}/3] Échec pour \"{}\". Nouvelle tentative via : {}",
                                attempt_idx + 1,
                                track.title,
                                strat.name
                            ),
                        );
                    } else {
                        // Notification début de téléchargement normal
                        let _ = app.emit(
                            "track-status",
                            serde_json::json!({
                                "id": track_id,
                                "status": "Downloading",
                                "progress": 0.0,
                                "speed": "0 KiB/s"
                            }),
                        );
                        emit_log(&app, "ytdlp", &format!("Démarrage: {}", track.title));
                    }

                    let mut cmd = Command::new(&ytdlp);
                    cmd.creation_flags(CREATE_NO_WINDOW);

                    let ffmpeg_str = ffmpeg_dir.to_string_lossy().to_string();
                    let album_arg = format!("{}:%(album)s", album_name);
                    let out_arg = format!("{}/%(title)s.%(ext)s", out_folder);

                    let mut args = vec![
                        "--ffmpeg-location".to_string(),
                        ffmpeg_str,
                        "-x".to_string(),
                        "--audio-format".to_string(),
                        "mp3".to_string(),
                        "--audio-quality".to_string(),
                        quality.clone(),
                        "--embed-metadata".to_string(),
                        "--add-metadata".to_string(),
                        "--parse-metadata".to_string(),
                        album_arg,
                        "-o".to_string(),
                        out_arg,
                        "--newline".to_string(),
                        "--progress-template".to_string(),
                        "download:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s".to_string(),
                        "--no-playlist".to_string(),
                    ];

                    if strat.embed_thumbnail {
                        args.push("--embed-thumbnail".to_string());
                    }

                    if let Some(client) = strat.extractor_client {
                        args.push("--extractor-args".to_string());
                        args.push(client.to_string());
                    }

                    if let Some(fmt) = strat.format_spec {
                        args.push("--format".to_string());
                        args.push(fmt.to_string());
                    }

                    for flag in &strat.extra_flags {
                        args.push(flag.to_string());
                    }

                    args.push(track_url.clone());
                    cmd.args(&args);

                    cmd.stdout(std::process::Stdio::piped());
                    cmd.stderr(std::process::Stdio::piped());

                    let mut child = match cmd.spawn() {
                        Ok(c) => c,
                        Err(e) => {
                            last_error = format!("Échec spawn: {}", e);
                            continue;
                        }
                    };

                    if let Some(stdout) = child.stdout.take() {
                        let mut reader = BufReader::new(stdout).lines();
                        while let Ok(Some(line)) = reader.next_line().await {
                            if is_canc.load(Ordering::SeqCst) {
                                let _ = child.kill().await;
                                return;
                            }

                            if line.starts_with("download:") {
                                let parts: Vec<&str> = line[9..].split('|').collect();
                                if parts.len() >= 2 {
                                    let percent_str = parts[0].replace('%', "").trim().to_string();
                                    let percent: f64 = percent_str.parse().unwrap_or(0.0);
                                    let speed = parts[1].trim().to_string();

                                    let _ = app.emit(
                                        "track-status",
                                        serde_json::json!({
                                            "id": track_id,
                                            "status": if attempt_idx > 0 { format!("Tentative {} ({}%)", attempt_idx + 1, percent.min(100.0) as i64) } else { "Downloading".to_string() },
                                            "progress": percent,
                                            "speed": speed
                                        }),
                                    );

                                    let current_comp = *completed.lock().await;
                                    let _ = app.emit(
                                        "download-progress",
                                        GlobalProgress {
                                            completed_tracks: current_comp,
                                            total_tracks,
                                            current_speed: Some(speed),
                                            current_active_title: Some(track.title.clone()),
                                        },
                                    );
                                }
                            } else if line.contains("[ExtractAudio]") || line.contains("[EmbedThumbnail]") {
                                let _ = app.emit(
                                    "track-status",
                                    serde_json::json!({
                                        "id": track_id,
                                        "status": "Converting",
                                        "progress": 95.0,
                                        "speed": ""
                                    }),
                                );
                                emit_log(&app, "ffmpeg", &format!("Conversion MP3 320k / Tags : {}", track.title));
                            }
                        }
                    }

                    let status = child.wait().await;
                    match status {
                        Ok(s) if s.success() => {
                            succeeded = true;
                            let mut comp = completed.lock().await;
                            *comp += 1;
                            let count = *comp;

                            let _ = app.emit(
                                "track-status",
                                serde_json::json!({
                                    "id": track_id,
                                    "status": "Completed",
                                    "progress": 100.0,
                                    "speed": ""
                                }),
                            );

                            let _ = app.emit(
                                "download-progress",
                                GlobalProgress {
                                    completed_tracks: count,
                                    total_tracks,
                                    current_speed: None,
                                    current_active_title: None,
                                },
                            );

                            if attempt_idx > 0 {
                                emit_log(
                                    &app,
                                    "success",
                                    &format!(
                                        "✅ Succès pour \"{}\" via la méthode de secours [{}] ({}/{}) !",
                                        track.title, strat.name, count, total_tracks
                                    ),
                                );
                            } else {
                                emit_log(&app, "success", &format!("Terminé ({}/{}): {}", count, total_tracks, track.title));
                            }
                            break;
                        }
                        Ok(s) => {
                            last_error = format!("Code de sortie yt-dlp: {:?}", s.code());
                        }
                        Err(e) => {
                            last_error = format!("Erreur child wait: {}", e);
                        }
                    }
                }

                if !succeeded && !is_canc.load(Ordering::SeqCst) {
                    let _ = app.emit(
                        "track-status",
                        serde_json::json!({
                            "id": track_id,
                            "status": "Error",
                            "error_message": format!("Échec après 3 méthodes alternatives ({})", last_error)
                        }),
                    );
                    emit_log(
                        &app,
                        "error",
                        &format!("❌ Échec définitif pour \"{}\" après 3 méthodes alternatives", track.title),
                    );
                }
            });

            tasks.push(task);
        }

        // Attente de toutes les tâches
        for task in tasks {
            let _ = task.await;
        }

        if !is_cancelled.load(Ordering::SeqCst) {
            let _ = app_handle.emit(
                "download-finished",
                serde_json::json!({
                    "success": true,
                    "output_folder": output_folder_str
                }),
            );
            emit_log(&app_handle, "success", "Tous les téléchargements et conversions sont terminés !");
        }
    });

    Ok(())
}

/// Annule les téléchargements en cours
#[tauri::command]
pub fn cancel_download(
    app: AppHandle,
    state: State<'_, DownloadState>,
) -> Result<(), String> {
    state.is_cancelled.store(true, Ordering::SeqCst);
    emit_log(&app, "warn", "Interruption demandée par l'utilisateur.");
    Ok(())
}
