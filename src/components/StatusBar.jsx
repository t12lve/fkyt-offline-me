import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Zap } from 'lucide-react';

export function StatusBar({ binaryStatus, destinationDir, downloadThreads = 3, convertThreads = 6 }) {
  return (
    <footer className="w-full h-7 bg-[#07050d] border-t border-purple-500/15 px-4 flex items-center justify-between text-[11px] font-mono text-purple-400/60 select-none shrink-0 z-40">
      {/* Left: Engine & Ready indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Moteur Prêt</span>
        </div>

        <span className="text-purple-500/40">|</span>

        <span className="hidden sm:inline">
          yt-dlp {binaryStatus?.ytdlp_available ? 'actif' : 'manquant'} • ffmpeg {binaryStatus?.ffmpeg_available ? '320k' : 'manquant'}
        </span>
      </div>

      {/* Center: Dynamic threads display */}
      <div className="hidden md:flex items-center gap-2 text-purple-400/70 font-semibold">
        <Cpu className="w-3 h-3 text-pink-400" />
        <span>Pool : {downloadThreads} Th. Download • {convertThreads} Th. Encodage</span>
      </div>

      {/* Right: Storage path info */}
      <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
        <HardDrive className="w-3 h-3 text-fuchsia-400 shrink-0" />
        <span className="text-purple-300/70 truncate" title={destinationDir}>
          {destinationDir || 'Musique par défaut'}
        </span>
      </div>
    </footer>
  );
}
