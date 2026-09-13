import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Headphones, 
  Radio, 
  Sparkles,
  Music
} from 'lucide-react';
import { formatDuration } from '../utils/formatting';

export function TrackList({ tracks }) {
  if (!tracks || tracks.length === 0) return null;

  const renderStatusBadge = (track) => {
    switch (track.status) {
      case 'Downloading':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
              <span>{track.progress ? `${Math.round(track.progress)}%` : 'Téléchargement...'}</span>
            </div>
            {track.speed && (
              <span className="hidden sm:inline text-[11px] font-mono text-purple-400/80">
                {track.speed}
              </span>
            )}
          </div>
        );

      case 'Converting':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-spin-slow" />
            <span>Encodage 320k...</span>
          </div>
        );

      case 'Completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminé</span>
          </div>
        );

      case 'Error':
        return (
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono"
            title={track.error_message || 'Erreur lors du téléchargement'}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="truncate max-w-[120px]">Erreur</span>
          </div>
        );

      case 'Pending':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-psylocke-darkest/60 border border-purple-500/15 text-purple-400/70 text-xs font-mono">
            <Clock className="w-3 h-3 text-purple-400/50" />
            <span>En attente</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-6 border-purple-500/25 flex flex-col shadow-psionic">
      {/* Title & Counter */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200">
            File d'Attente ({tracks.length} titres)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-purple-400/70">
          Conversion systématique MP3 320kbps
        </span>
      </div>

      {/* Scrollable Track Queue */}
      <div className="max-h-80 overflow-y-auto pr-1.5 space-y-2">
        {tracks.map((track, idx) => {
          const isCurrent = track.status === 'Downloading' || track.status === 'Converting';
          
          return (
            <div
              key={track.id || idx}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-purple-900/30 border-fuchsia-500/40 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                  : track.status === 'Completed'
                  ? 'bg-emerald-950/20 border-emerald-500/20'
                  : 'bg-psylocke-surface/40 border-purple-500/10 hover:border-purple-500/30'
              }`}
            >
              {/* Left: Index & Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-7 text-center text-xs font-mono text-purple-400/60 font-semibold shrink-0">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-100 truncate flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                    <span className="truncate">{track.title}</span>
                  </p>
                  {track.uploader && (
                    <p className="text-[11px] text-purple-400/60 truncate font-mono ml-5">
                      {track.uploader}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Duration & Status */}
              <div className="flex items-center gap-3 shrink-0">
                {track.duration > 0 && (
                  <span className="text-xs font-mono text-purple-400/70 hidden sm:inline">
                    {formatDuration(track.duration)}
                  </span>
                )}
                {renderStatusBadge(track)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
