import React from 'react';
import { Play, Square, FolderCheck, CheckCircle2, RotateCcw, ListOrdered } from 'lucide-react';

export function ActionFooter({
  canStart,
  isDownloading,
  isQueueRunning,
  hasCompleted,
  queueLength = 0,
  onStartQueue,
  onCancelDownload,
  onOpenFolder,
  onReset
}) {
  const isRunning = isDownloading || isQueueRunning;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border-purple-500/25 flex flex-col gap-3 shadow-psionic shrink-0">
      {/* Completion Alert Banner */}
      {hasCompleted && (
        <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Toutes les extractions et conversions sont terminées !</span>
        </div>
      )}

      {/* Main Execution Button */}
      {isRunning ? (
        <button
          type="button"
          onClick={onCancelDownload}
          className="w-full h-12 px-5 rounded-xl bg-red-950/80 hover:bg-red-900/90 border border-red-500/60 text-red-200 font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(239,68,68,0.35)] cursor-pointer"
        >
          <Square className="w-4 h-4 fill-red-400 text-red-400 shrink-0" />
          <span>Arrêter l'extraction</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartQueue}
          disabled={!canStart}
          className={`w-full h-12 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
            canStart
              ? 'btn-psychic-blade text-white shadow-psionic cursor-pointer'
              : 'bg-purple-950/40 text-purple-400/50 border border-purple-500/20 cursor-not-allowed'
          }`}
        >
          {queueLength > 1 ? (
            <>
              <ListOrdered className="w-4 h-4 shrink-0" />
              <span>Lancer la File ({queueLength} playlists)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white shrink-0" />
              <span>Lancer l'Extraction</span>
            </>
          )}
        </button>
      )}

      {/* Secondary Actions Row */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Open Output Folder */}
        <button
          type="button"
          onClick={onOpenFolder}
          className={`h-10 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            hasCompleted
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(160,185,129,0.4)] border border-emerald-400/40 hover:scale-[1.02]'
              : 'bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 hover:text-white'
          }`}
        >
          <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dossier de sortie</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="h-10 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/20 text-purple-300 hover:text-purple-100 text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>
    </div>
  );
}

export default ActionFooter;
