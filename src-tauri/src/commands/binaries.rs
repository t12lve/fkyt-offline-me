use crate::engine::ffmpeg::resolve_ffmpeg_path;
use crate::engine::models::BinaryStatus;
use crate::engine::ytdlp::resolve_ytdlp_path;
use tauri::AppHandle;

#[tauri::command]
pub fn check_binaries(app: AppHandle) -> BinaryStatus {
    let ytdlp = resolve_ytdlp_path(Some(&app));
    let ffmpeg = resolve_ffmpeg_path(Some(&app));

    BinaryStatus {
        ytdlp_available: ytdlp.is_some(),
        ytdlp_path: ytdlp.map(|p| p.to_string_lossy().to_string()),
        ffmpeg_available: ffmpeg.is_some(),
        ffmpeg_path: ffmpeg.map(|p| p.to_string_lossy().to_string()),
    }
}
