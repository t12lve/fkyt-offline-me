import React from 'react';
import { Activity, Gauge, CheckCircle, Layers } from 'lucide-react';

export function ProgressBar({ progress, totalTracks, isDownloading, queue, currentQueueIndex }) {
  const completed = progress?.completed_tracks || 0;
  const total = totalTracks || progress?.total_tracks || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const speed = progress?.current_speed || '';
  const currentTitle = progress?.current_active_title || '';

  const queueTotal = queue?.length || 0;
  const queueCompleted = queue?.filter(q => q.status === 'Completed').length || 0;

  if (total === 0 && !isDownloading && queueTotal === 0) return null;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-6 border-purple-500/25 relative overflow-hidden shadow-psionic transition-all">
      {/* Top Details Row */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30">
            <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                Progression Playlist En Cours
              </span>
              {queueTotal > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/50 text-fuchsia-300 border border-purple-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-pink-400" />
                  Playlist #{currentQueueIndex + 1} / {queueTotal}
                </span>
              )}
            </div>
            {currentTitle && (
              <p className="text-[11px] text-purple-400/80 truncate max-w-md font-mono mt-0.5">
                Piste : {currentTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {speed && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 bg-psylocke-surface/90 px-2.5 py-1 rounded-lg border border-purple-500/20">
              <Gauge className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{speed}</span>
            </div>
          )}

          <div className="text-right">
            <span className="text-sm font-bold font-mono text-white">
              {completed} <span className="text-purple-400 font-normal">/ {total}</span>
            </span>
            <span className="text-xs font-mono text-fuchsia-400 font-semibold ml-2">
              ({percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3.5 bg-psylocke-darkest/90 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out relative progress-aura"
          style={{ 
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #9333ea 0%, #c026d3 50%, #ec4899 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>

      {/* Global Queue Progress Indicator (if multiple playlists) */}
      {queueTotal > 1 && (
        <div className="mt-3 pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-xs font-mono text-purple-300/80">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
            File globale : {queueCompleted} sur {queueTotal} playlists terminées
          </span>
          <span className="text-fuchsia-400 font-semibold">
            {Math.round((queueCompleted / queueTotal) * 100)}% de la file
          </span>
        </div>
      )}
    </div>
  );
}
