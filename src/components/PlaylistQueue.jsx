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
  Layers,
  ChevronRight,
  Music2
} from 'lucide-react';

export function PlaylistQueue({
  queue = [],
  currentQueueIndex = 0,
  onSelectQueueItem,
  onRemoveFromQueue,
  onOpenPlaylistFolder,
  onClearQueue,
  isQueueRunning
}) {
  const completedCount = queue.filter(q => q.status === 'Completed').length;
  const hasItems = queue.length > 0;

  return (
    <div className="flex-1 min-h-0 glass-panel rounded-2xl p-5 border-purple-500/25 flex flex-col shadow-psionic transition-all overflow-hidden">
      {/* Queue Header - Always Visible */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/15 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30">
            <ListOrdered className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
                File d'Attente Playlists
              </h3>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-fuchsia-300 border border-purple-500/40">
                {queue.length}
              </span>
            </div>
            <p className="text-xs text-purple-400/70 font-mono mt-0.5">
              {hasItems 
                ? `${completedCount} / ${queue.length} terminée${completedCount > 1 ? 's' : ''}` 
                : 'Aucune tâche en attente'}
            </p>
          </div>
        </div>

        {/* Clear Queue Button */}
        {hasItems && !isQueueRunning && (
          <button
            type="button"
            onClick={onClearQueue}
            className="text-xs text-purple-300 hover:text-red-400 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Vider la file d'attente"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider la file</span>
          </button>
        )}
      </div>

      {/* Anticipated Empty State vs Populated List */}
      {!hasItems ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-purple-500/20 rounded-2xl bg-purple-950/10 text-center select-none min-h-[160px]">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/25 flex items-center justify-center mb-3 shadow-inner">
            <Disc3 className="w-7 h-7 text-purple-400/60 animate-spin-slow" />
          </div>
          <p className="text-sm font-semibold text-purple-200 mb-1">
            File d'attente vide
          </p>
          <p className="text-xs text-purple-400/60 max-w-[280px] leading-relaxed">
            Collez un ou plusieurs liens YouTube ci-dessus pour préparer vos téléchargements groupés.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
          {queue.map((item, idx) => {
            const isCurrentActive = idx === currentQueueIndex;
            const isDownloading = item.status === 'Downloading';
            const isCompleted = item.status === 'Completed';
            const isError = item.status === 'Error';

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectQueueItem(idx)}
                className={`group flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isDownloading
                    ? 'bg-purple-900/50 border-pink-500/70 shadow-[0_0_18px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/40'
                    : isCurrentActive
                    ? 'bg-purple-950/80 border-fuchsia-500/60 shadow-md'
                    : isCompleted
                    ? 'bg-emerald-950/25 border-emerald-500/30'
                    : 'bg-psylocke-surface/50 border-purple-500/15 hover:border-purple-500/35 hover:bg-purple-950/40'
                }`}
              >
                {/* Left: Index, Thumbnail & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono font-bold text-purple-400/80 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 bg-psylocke-darkest shadow-sm">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate transition-colors ${
                      isCurrentActive ? 'text-white' : 'text-purple-200 group-hover:text-white'
                    }`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-400/70 font-mono mt-0.5">
                      <span>{item.entries?.length || 0} pistes</span>
                      {item.uploader && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{item.uploader}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Actions */}
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isDownloading && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/80 border border-pink-500/50 text-pink-300 text-xs font-mono animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                      <span>En cours</span>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Terminé</span>
                      </div>
                      {item.output_folder && (
                        <button
                          type="button"
                          onClick={() => onOpenPlaylistFolder(item.output_folder)}
                          className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-emerald-900/60 border border-purple-500/30 hover:border-emerald-400/50 text-purple-300 hover:text-emerald-300 transition-colors cursor-pointer"
                          title="Ouvrir le dossier"
                        >
                          <FolderCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {isError && (
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-mono"
                      title={item.error_message || 'Erreur'}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Erreur</span>
                    </div>
                  )}

                  {!isDownloading && !isCompleted && !isError && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-psylocke-darkest/70 border border-purple-500/15 text-purple-400/80 text-xs font-mono">
                      <Clock className="w-3 h-3 text-purple-400/50" />
                      <span>Attente</span>
                    </div>
                  )}

                  {/* Remove Item */}
                  {!isDownloading && (
                    <button
                      type="button"
                      onClick={() => onRemoveFromQueue(idx)}
                      className="p-1.5 rounded-lg hover:bg-red-950/60 border border-transparent hover:border-red-500/30 text-purple-400/60 hover:text-red-400 transition-all cursor-pointer"
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
      )}
    </div>
  );
}

export default PlaylistQueue;
