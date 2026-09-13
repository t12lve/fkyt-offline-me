/**
 * Format raw duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '--:--';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format bytes to readable string (e.g. 15.4 MB)
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '--';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format download speed
 */
export function formatSpeed(speedStr) {
  if (!speedStr) return '';
  return speedStr.trim();
}

/**
 * Sanitize playlist title for display / folder preview
 */
export function sanitizeFolderName(name) {
  if (!name) return 'Unknown Playlist';
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}
