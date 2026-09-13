use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistInfo {
    pub id: Option<String>,
    pub title: String,
    pub uploader: Option<String>,
    pub thumbnail: Option<String>,
    pub output_folder: String,
    pub entries: Vec<TrackItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackItem {
    pub id: String,
    pub title: String,
    pub url: Option<String>,
    pub uploader: Option<String>,
    pub duration: Option<f64>,
    pub status: String, // "Pending", "Downloading", "Converting", "Completed", "Error"
    pub progress: Option<f64>,
    pub speed: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalProgress {
    pub completed_tracks: usize,
    pub total_tracks: usize,
    pub current_speed: Option<String>,
    pub current_active_title: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogLine {
    pub timestamp: String,
    pub level: String, // "info", "warn", "error", "ytdlp", "ffmpeg", "success"
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryStatus {
    pub ytdlp_available: bool,
    pub ytdlp_path: Option<String>,
    pub ffmpeg_available: bool,
    pub ffmpeg_path: Option<String>,
}
