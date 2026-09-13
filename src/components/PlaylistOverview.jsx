import React from 'react';
import { 
  ListMusic, 
  FolderCheck, 
  Disc3, 
  User, 
  Clock, 
  Layers, 
  Activity, 
  Gauge, 
  CheckCircle2,
  Music
} from 'lucide-react';
import { formatDuration } from '../utils/formatting';

export function PlaylistOverview({ 
  playlist, 
  fullOutputPath, 
  progress, 
  totalTracks, 
  isDownloading, 
  queue = [], 
  currentQueueIndex = 0 
}) {
  const hasPlaylist = Boolean(playlist);
  const total = totalTracks || playlist?.entries?.length || progress?.total_tracks || 0;
  const completed = progress?.completed_tracks || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const speed = progress?.current_speed || '';
  const currentTitle = progress?.current_active_title || '';

  const queueTotal = queue.length;
  const queueCompleted = queue.filter(q => q.status === 'Completed').length;
  const totalDuration = playlist?.entries?.reduce((acc, curr) => acc + (curr.duration || 0), 0) || 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border-purple-500/25 relative overflow-hidden transition-all shadow-psionic shrink-0">
      {/* Background Energy Glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-purple-500/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30">
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
              {hasPlaylist ? 'Playlist Active' : 'Playlist Active (En attente)'}
            </h3>
            {queueTotal > 1 && hasPlaylist && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-900/60 text-fuchsia-300 border border-purple-500/40 font-semibold">
                Playlist #{currentQueueIndex + 1} / {queueTotal}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            MP3 320kbps • Tags ID3 Automatiques
          </span>
        </div>
      </div>

      {/* Playlist Meta & Cover Row */}
      <div className="flex items-center gap-5 mb-4">
        {/* Thumbnail Artwork */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden border-2 border-fuchsia-500/40 shadow-psionic bg-psylocke-darkest group">
          {hasPlaylist && playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950/70 to-psylocke-darkest">
              <Disc3 className={`w-12 h-12 text-purple-400/40 ${isDownloading ? 'animate-spin-slow text-pink-400' : ''}`} />
            </div>
          )}
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-fuchsia-300 font-bold border border-fuchsia-500/30">
            320k
          </span>
        </div>

        {/* Playlist Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {hasPlaylist && playlist.uploader ? (
              <span className="text-xs sm:text-sm text-purple-300/90 flex items-center gap-1.5 font-medium truncate">
                <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{playlist.uploader}</span>
              </span>
            ) : (
              <span className="text-xs text-purple-400/60 font-mono">
                {hasPlaylist ? 'Auteur inconnu' : 'En attente d\'une URL ou d\'une sélection'}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide truncate mb-2.5 font-sans drop-shadow-sm">
            {hasPlaylist ? playlist.title : 'Aucune playlist sélectionnée'}
          </h2>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2.5 text-xs text-purple-300/90 font-mono flex-wrap">
            <div className="flex items-center gap-1.5 bg-psylocke-surface/90 px-3 py-1 rounded-xl border border-purple-500/20">
              <ListMusic className="w-3.5 h-3.5 text-pink-400" />
              <span>{total} pistes</span>
            </div>

            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5 bg-psylocke-surface/90 px-3 py-1 rounded-xl border border-purple-500/20">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>~{formatDuration(totalDuration)}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-psylocke-darkest/80 px-3 py-1 rounded-xl border border-purple-500/20 text-purple-300/80 truncate max-w-md">
              <FolderCheck className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span className="truncate" title={fullOutputPath}>{fullOutputPath || 'Dossier Musique racine'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar & Stats Section */}
      <div className="bg-psylocke-darkest/80 rounded-2xl p-3.5 border border-purple-500/25">
        <div className="flex items-center justify-between gap-3 mb-2 text-xs font-mono">
          {/* Active track name or state */}
          <div className="flex items-center gap-2 truncate max-w-lg">
            {isDownloading ? (
              <>
                <Activity className="w-4 h-4 text-pink-400 animate-pulse shrink-0" />
                <span className="text-xs text-purple-100 font-semibold truncate">
                  {currentTitle ? `Piste en cours : ${currentTitle}` : 'Téléchargement et conversion en cours...'}
                </span>
              </>
            ) : percent === 100 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-300 font-semibold">
                  Playlist 100% extraite et convertie en MP3 320k !
                </span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4 text-purple-400/50 shrink-0" />
                <span className="text-xs text-purple-400/70">
                  {hasPlaylist ? 'Prêt pour l\'extraction' : 'En attente d\'une playlist dans la file'}
                </span>
              </>
            )}
          </div>

          {/* Speed & Counter */}
          <div className="flex items-center gap-3.5 shrink-0">
            {speed && isDownloading && (
              <div className="flex items-center gap-1.5 text-xs text-purple-200 bg-purple-950/70 px-2.5 py-1 rounded-lg border border-purple-500/25">
                <Gauge className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>{speed}</span>
              </div>
            )}

            <div className="text-right">
              <span className="text-sm font-bold text-white">
                {completed} <span className="text-purple-400 font-normal">/ {total}</span>
              </span>
              <span className="text-sm text-fuchsia-400 font-bold ml-2">
                ({percent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-3 bg-psylocke-surface/90 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out relative progress-aura"
            style={{ 
              width: `${percent}%`,
              background: percent > 0 ? 'linear-gradient(90deg, #9333ea 0%, #c026d3 50%, #ec4899 100%)' : 'transparent',
            }}
          >
            {isDownloading && percent > 0 && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" 
                style={{ backgroundSize: '200% 100%' }} 
              />
            )}
          </div>
        </div>

        {/* Multi-playlist Global Queue Tracker */}
        {queueTotal > 1 && (
          <div className="mt-2.5 pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-xs font-mono text-purple-400/80">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
              Progression globale de la file : {queueCompleted} sur {queueTotal} playlists terminées
            </span>
            <span className="text-fuchsia-400 font-bold">
              {Math.round((queueCompleted / queueTotal) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistOverview;
