import React from 'react';
import { Play, Square, FolderCheck, CheckCircle2, RotateCcw, ListOrdered } from 'lucide-react';

export function ActionFooter({
  canStart,
  isDownloading,
  isQueueRunning,
  hasCompleted,
  queueLength,
  onStartQueue,
  onCancelDownload,
  onOpenFolder,
  onReset
}) {
  const isRunning = isDownloading || isQueueRunning;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 mb-6 border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-psionic">
      {/* Left info or reset */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        {hasCompleted && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tous les téléchargements & conversions sont terminés !</span>
          </div>
        )}

        {(hasCompleted || !isRunning) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-purple-400 hover:text-purple-200 px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Open Folder Button */}
        <button
          type="button"
          onClick={onOpenFolder}
          className={`h-12 px-5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            hasCompleted
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 hover:scale-[1.02]'
              : 'bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 hover:text-white'
          }`}
        >
          <FolderCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Dossier de sortie</span>
        </button>

        {/* Start / Cancel Queue Download */}
        {isRunning ? (
          <button
            type="button"
            onClick={onCancelDownload}
            className="h-12 px-6 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/50 text-red-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
          >
            <Square className="w-4 h-4 fill-red-400 text-red-400 shrink-0" />
            <span>Arrêter la file</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartQueue}
            disabled={!canStart}
            className={`h-12 px-8 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all ${
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
      </div>
    </div>
  );
}
