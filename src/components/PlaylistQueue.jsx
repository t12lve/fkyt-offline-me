import React from 'react';
import { 
  ListOrdered, 
  FolderCheck, 
  Trash2, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Disc3, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function PlaylistQueue({
  queue,
  currentQueueIndex,
  onSelectQueueItem,
  onRemoveFromQueue,
  onOpenPlaylistFolder,
  onClearQueue,
  isQueueRunning
}) {
  if (!queue || queue.length === 0) return null;

  const completedCount = queue.filter(q => q.status === 'Completed').length;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-6 border-purple-500/25 flex flex-col shadow-psionic transition-all">
      {/* Queue Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/15">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30">
            <ListOrdered className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200">
              File d'Attente ({queue.length} {queue.length > 1 ? 'playlists' : 'playlist'})
            </h3>
            <p className="text-[11px] text-purple-400/70 font-mono">
              {completedCount} sur {queue.length} terminée{completedCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Clear Queue Button */}
        {!isQueueRunning && (
          <button
            type="button"
            onClick={onClearQueue}
            className="text-xs text-purple-400 hover:text-red-400 px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider la file</span>
          </button>
        )}
      </div>

      {/* Queue Items List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {queue.map((item, idx) => {
          const isCurrentActive = idx === currentQueueIndex;
          const isDownloading = item.status === 'Downloading';
          const isCompleted = item.status === 'Completed';
          const isError = item.status === 'Error';

          return (
            <div
              key={item.id || idx}
              onClick={() => onSelectQueueItem(idx)}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isDownloading
                  ? 'bg-purple-900/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.25)] ring-1 ring-pink-500/30'
                  : isCurrentActive
                  ? 'bg-purple-950/60 border-purple-500/40 shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/25'
                  : 'bg-psylocke-surface/50 border-purple-500/10 hover:border-purple-500/30'
              }`}
            >
              {/* Left: Index, Thumbnail & Playlist Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Index Pill */}
                <span className="w-6 text-center text-xs font-mono font-bold text-purple-400/80 shrink-0">
                  #{idx + 1}
                </span>

                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-purple-500/30 shrink-0 bg-psylocke-darkest">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc3 className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                </div>

                {/* Title & Stats */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-purple-100 truncate font-sans">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-purple-400/70 font-mono mt-0.5">
                    <span>{item.entries?.length || 0} pistes</span>
                    {item.uploader && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.uploader}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status Pill & Actions */}
              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Status Badges */}
                {isDownloading && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-mono animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                    <span>En cours</span>
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Terminé</span>
                    </div>
                    {item.output_folder && (
                      <button
                        type="button"
                        onClick={() => onOpenPlaylistFolder(item.output_folder)}
                        className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-emerald-900/60 border border-purple-500/30 hover:border-emerald-400/50 text-purple-300 hover:text-emerald-300 transition-colors"
                        title="Ouvrir le dossier de cette playlist"
                      >
                        <FolderCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {isError && (
                  <div 
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono"
                    title={item.error_message || 'Erreur'}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Erreur</span>
                  </div>
                )}

                {!isDownloading && !isCompleted && !isError && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-psylocke-darkest/60 border border-purple-500/15 text-purple-400/70 text-xs font-mono">
                    <Clock className="w-3 h-3 text-purple-400/50" />
                    <span>En attente</span>
                  </div>
                )}

                {/* Remove button (only if not currently downloading) */}
                {!isDownloading && (
                  <button
                    type="button"
                    onClick={() => onRemoveFromQueue(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-950/50 border border-transparent hover:border-red-500/30 text-purple-400 hover:text-red-400 transition-all"
                    title="Retirer de la file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <ChevronRight className={`w-4 h-4 text-purple-400/40 transition-transform ${isCurrentActive ? 'rotate-90 text-pink-400' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
