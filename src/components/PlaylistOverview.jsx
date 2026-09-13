import React from 'react';
import { ListMusic, FolderCheck, Disc3, User, Clock, Layers } from 'lucide-react';
import { formatDuration } from '../utils/formatting';

export function PlaylistOverview({ playlist, fullOutputPath }) {
  if (!playlist) return null;

  const totalDuration = playlist.entries?.reduce((acc, curr) => acc + (curr.duration || 0), 0) || 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-6 border-purple-500/30 relative overflow-hidden transition-all shadow-psionic">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Cover / Thumbnail Preview */}
        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-fuchsia-500/40 shadow-psionic group">
          {playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-psylocke-darkest flex items-center justify-center">
              <Disc3 className="w-10 h-10 text-fuchsia-400 animate-spin-slow" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-fuchsia-300 font-bold">
            320k
          </span>
        </div>

        {/* Playlist Info & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-pink-400" />
              Playlist Détectée
            </span>
            {playlist.uploader && (
              <span className="text-xs text-purple-300/80 flex items-center gap-1 font-medium">
                <User className="w-3 h-3 text-purple-400" />
                {playlist.uploader}
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-bold text-white tracking-wide truncate mb-2 drop-shadow-sm font-sans">
            {playlist.title}
          </h2>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs text-purple-300/90 font-mono mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-psylocke-surface/80 px-2.5 py-1 rounded-lg border border-purple-500/20">
              <ListMusic className="w-3.5 h-3.5 text-pink-400" />
              <span>{playlist.entries?.length || 0} pistes</span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5 bg-psylocke-surface/80 px-2.5 py-1 rounded-lg border border-purple-500/20">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>~{formatDuration(totalDuration)} total</span>
              </div>
            )}
            <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              MP3 320kbps • Cover Embed • Tag Album auto
            </div>
          </div>

          {/* Output Subfolder Target */}
          <div className="flex items-center gap-2 text-xs text-purple-300/70 font-mono bg-psylocke-darkest/70 px-3 py-1.5 rounded-xl border border-purple-500/15 truncate">
            <FolderCheck className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            <span className="text-purple-400/60 shrink-0">Dossier cible :</span>
            <span className="text-purple-200 truncate">{fullOutputPath}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
