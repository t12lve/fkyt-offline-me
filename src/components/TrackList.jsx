import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Headphones, 
  Sparkles,
  Music,
  RotateCw
} from 'lucide-react';
import { formatDuration } from '../utils/formatting';

export function TrackList({ tracks = [], isDownloading }) {
  const hasTracks = tracks && tracks.length > 0;

  const renderStatusBadge = (track) => {
    const status = track.status || 'Pending';

    if (status.startsWith('Tentative')) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-mono animate-pulse" title="Nouvelle tentative avec méthode de secours alternative">
          <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>{status}</span>
        </div>
      );
    }

    switch (status) {
      case 'Downloading':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-fuchsia-950/70 border border-fuchsia-500/50 text-fuchsia-300 text-xs font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
              <span>{track.progress ? `${Math.round(track.progress)}%` : 'Téléchargement...'}</span>
            </div>
            {track.speed && (
              <span className="text-xs font-mono text-purple-300/80">
                {track.speed}
              </span>
            )}
          </div>
        );

      case 'Converting':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/70 border border-purple-500/50 text-purple-200 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-spin-slow" />
            <span>Encodage 320k...</span>
          </div>
        );

      case 'Completed':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminé</span>
          </div>
        );

      case 'Error':
        return (
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-mono"
            title={track.error_message || 'Échec après 3 méthodes alternatives'}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Erreur</span>
          </div>
        );

      case 'Pending':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-psylocke-darkest/70 border border-purple-500/15 text-purple-400/80 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-purple-400/50" />
            <span>En attente</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 min-h-0 glass-panel rounded-2xl p-5 border-purple-500/25 flex flex-col shadow-psionic overflow-hidden">
      {/* Workstation Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-purple-500/15 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <Headphones className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-200">
              Titres de la Playlist
            </h3>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-fuchsia-300 border border-purple-500/40">
              {tracks.length} titres
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-purple-400/70">
          Extraction audio haute fidélité • MP3 320kbps • Retry multi-méthodes résilient
        </span>
      </div>

      {/* Table Column Labels Bar */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-psylocke-darkest/90 rounded-xl text-xs font-mono uppercase tracking-wider text-purple-400/70 font-bold mb-2.5 shrink-0 border border-purple-500/15 items-center">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5 truncate">Titre de la Piste</div>
        <div className="col-span-3 truncate">Artiste / Chaîne YouTube</div>
        <div className="col-span-1 text-center">Durée</div>
        <div className="col-span-2 text-right pr-2">Statut & Étape</div>
      </div>

      {/* Body: Anticipated Empty State vs Track Rows */}
      {!hasTracks ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-purple-500/20 rounded-2xl bg-purple-950/10 text-center select-none min-h-[220px]">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/25 flex items-center justify-center mb-3.5 shadow-inner">
            <Music className="w-8 h-8 text-purple-400/50" />
          </div>
          <p className="text-base font-semibold text-purple-200 mb-1">
            Aucune piste à afficher
          </p>
          <p className="text-xs sm:text-sm text-purple-400/60 max-w-md leading-relaxed mb-4">
            Sélectionnez une playlist à gauche pour inspecter tous ses titres. La progression en direct, l'encodage MP3 320k et les tentatives de secours s'afficheront en temps réel.
          </p>
          <div className="flex items-center gap-6 text-xs font-mono text-purple-400/50">
            <span>• Détection automatique des tags ID3</span>
            <span>• Téléchargement multi-threads</span>
            <span>• Pochette HD embarquée</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {tracks.map((track, idx) => {
            const isCurrent = track.status === 'Downloading' || track.status === 'Converting' || (track.status && track.status.startsWith('Tentative'));
            
            return (
              <div
                key={track.id || idx}
                className={`grid grid-cols-12 gap-3 items-center px-4 py-2.5 rounded-xl border transition-all text-xs sm:text-sm ${
                  isCurrent
                    ? 'bg-purple-900/40 border-fuchsia-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)] ring-1 ring-pink-500/30'
                    : track.status === 'Completed'
                    ? 'bg-emerald-950/20 border-emerald-500/25'
                    : track.status === 'Error'
                    ? 'bg-red-950/25 border-red-500/30'
                    : 'bg-psylocke-surface/40 border-purple-500/10 hover:border-purple-500/35 hover:bg-purple-950/30'
                }`}
              >
                {/* Index */}
                <div className="col-span-1 text-center font-mono text-xs font-bold text-purple-400/80">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>

                {/* Track Title */}
                <div className="col-span-5 min-w-0 pr-2">
                  <p className="font-semibold text-purple-100 truncate flex items-center gap-2" title={track.title}>
                    <Music className="w-4 h-4 text-purple-400/70 shrink-0" />
                    <span className="truncate">{track.title}</span>
                  </p>
                </div>

                {/* Uploader / Artist */}
                <div className="col-span-3 truncate font-mono text-xs text-purple-300/80" title={track.uploader}>
                  {track.uploader || '—'}
                </div>

                {/* Duration */}
                <div className="col-span-1 text-center font-mono text-xs text-purple-400/80">
                  {track.duration > 0 ? formatDuration(track.duration) : '—'}
                </div>

                {/* Status Badge */}
                <div className="col-span-2 flex justify-end">
                  {renderStatusBadge(track)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrackList;
