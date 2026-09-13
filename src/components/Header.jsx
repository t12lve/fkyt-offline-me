import React from 'react';
import { 
  Zap, 
  Music2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ListMusic, 
  TrendingDown,
  Sliders
} from 'lucide-react';

export function Header({ 
  binaryStatus, 
  activeTab, 
  onTabChange,
  systemSpecs,
  downloadThreads,
  onOpenThreadModal
}) {
  const ytdlpReady = binaryStatus?.ytdlp_available;
  const ffmpegReady = binaryStatus?.ffmpeg_available;
  const cores = systemSpecs?.logical_cores || 4;

  return (
    <header className="relative w-full py-3.5 px-5 mb-5 glass-panel rounded-2xl border-psylocke-border shadow-psionic">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Psionic Motif */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 shadow-psionic p-0.5 shrink-0">
            <div className="w-full h-full bg-psylocke-bg rounded-[9px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-fuchsia-400 fill-fuchsia-500/30 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-purple-300 via-fuchsia-200 to-pink-400 bg-clip-text text-transparent font-sans">
                fkYT <span className="font-light text-fuchsia-400">offline me</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-mono font-semibold">
                v2.3
              </span>
            </div>
            <p className="text-[11px] text-psylocke-muted flex items-center gap-1.5 mt-0.5">
              <Music2 className="w-3 h-3 text-purple-400 shrink-0" />
              <span>Multi-threads adaptatif & audio haute fidélité</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-psylocke-darkest/80 border border-purple-500/25 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('downloader')}
            className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeTab === 'downloader'
                ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-pink-400/30'
                : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-950/40'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Téléchargeur Playlists</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('compressor')}
            className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
              activeTab === 'compressor'
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-400/30'
                : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-950/40'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Compresseur & Gain d'Espace</span>
          </button>
        </div>

        {/* System Badges & Thread Performance Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Interactive CPU & Thread Badge */}
          <button
            type="button"
            onClick={onOpenThreadModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 hover:border-pink-500/50 text-xs text-purple-200 font-mono transition-all group shadow-sm cursor-pointer"
            title="Cliquez pour configurer les threads et voir les performances détectées"
          >
            <Cpu className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>{cores} Coeurs • {downloadThreads} Th.</span>
            <Sliders className="w-3 h-3 text-fuchsia-400 opacity-70 group-hover:opacity-100" />
          </button>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            ytdlpReady 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            {ytdlpReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            <span>yt-dlp</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            ffmpegReady 
              ? 'bg-purple-950/40 border-fuchsia-500/30 text-fuchsia-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            {ffmpegReady ? <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            <span>ffmpeg</span>
          </div>
        </div>
      </div>
    </header>
  );
}
