import React from 'react';
import { 
  X, 
  Cpu, 
  HardDrive, 
  Zap, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Flame
} from 'lucide-react';

export function ThreadConfigModal({
  isOpen,
  onClose,
  systemSpecs,
  downloadThreads,
  setDownloadThreads,
  convertThreads,
  setConvertThreads,
}) {
  if (!isOpen) return null;

  const cores = systemSpecs?.logical_cores || 4;
  const ramGb = systemSpecs?.total_ram_gb || 16;
  const cpuModel = systemSpecs?.cpu_model || 'Processeur Multi-Cœur';
  const recDownload = systemSpecs?.recommended_download_threads || 3;
  const recConvert = systemSpecs?.recommended_convert_threads || 6;

  const handleApplyRecommended = () => {
    setDownloadThreads(recDownload);
    setConvertThreads(recConvert);
  };

  const handleApplyEco = () => {
    setDownloadThreads(1);
    setConvertThreads(2);
  };

  const handleApplyTurbo = () => {
    setDownloadThreads(4);
    setConvertThreads(Math.min(cores, 12));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl glass-panel rounded-3xl p-6 border-purple-500/40 shadow-psionic-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow ribbon */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-fuchsia-600/20 via-pink-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-psionic">
              <div className="w-full h-full bg-psylocke-bg rounded-[10px] p-1.5 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-fuchsia-300" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans tracking-wide">
                Configuration des Threads & Performance
              </h3>
              <p className="text-xs text-purple-300/70 font-mono">
                Autodétection matérielle & Recommandations intelligentes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-purple-900/40 text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detected Hardware Card */}
        <div className="p-4 rounded-2xl bg-psylocke-darkest/80 border border-purple-500/25 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              Matériel Détecté
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Système Optimisé
            </span>
          </div>

          <p className="text-sm font-bold text-white truncate font-mono">
            {cpuModel}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
            <div className="flex items-center gap-2 bg-purple-950/40 p-2 rounded-xl border border-purple-500/15">
              <Cpu className="w-4 h-4 text-pink-400 shrink-0" />
              <span>{cores} Cœurs Logiques</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-950/40 p-2 rounded-xl border border-purple-500/15">
              <HardDrive className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{ramGb} Go de RAM</span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={handleApplyRecommended}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-800 to-fuchsia-700 hover:from-purple-700 hover:to-fuchsia-600 border border-pink-500/40 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>Auto ({recDownload} / {recConvert} Th.)</span>
          </button>

          <button
            type="button"
            onClick={handleApplyEco}
            className="py-1.5 px-3 rounded-xl bg-psylocke-surface/70 hover:bg-purple-900/50 border border-purple-500/20 text-xs text-purple-300 font-medium transition-all"
          >
            Éco (1 / 2)
          </button>

          <button
            type="button"
            onClick={handleApplyTurbo}
            className="py-1.5 px-3 rounded-xl bg-psylocke-surface/70 hover:bg-purple-900/50 border border-purple-500/20 text-xs text-pink-300 font-medium flex items-center gap-1 transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            Turbo (4 / {Math.min(cores, 12)})
          </button>
        </div>

        {/* Slider 1: Download Threads (YouTube) */}
        <div className="space-y-2 mb-5 p-4 rounded-2xl bg-psylocke-surface/40 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-purple-100 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-pink-400" />
                Threads de Téléchargement (YouTube)
              </label>
              <p className="text-[11px] text-purple-400/70 font-mono mt-0.5">
                Flux simultanés pour les playlists (Recommandé : {recDownload} threads)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-pink-300 px-2.5 py-0.5 rounded-lg bg-pink-950/50 border border-pink-500/30">
                {downloadThreads}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={downloadThreads}
              onChange={(e) => setDownloadThreads(parseInt(e.target.value, 10))}
              className="flex-1 accent-pink-500 cursor-pointer h-2 bg-purple-950 rounded-lg"
            />
          </div>

          {downloadThreads > 4 && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-mono bg-amber-950/40 p-2 rounded-xl border border-amber-500/30 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Attention : YouTube peut limiter le débit au-delà de 3-4 flux simultanés.</span>
            </div>
          )}
        </div>

        {/* Slider 2: Conversion Threads (ffmpeg) */}
        <div className="space-y-2 mb-6 p-4 rounded-2xl bg-psylocke-surface/40 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-purple-100 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                Threads de Conversion Locale (ffmpeg)
              </label>
              <p className="text-[11px] text-purple-400/70 font-mono mt-0.5">
                Processus d'encodage parallèle (Recommandé : {recConvert} threads sur vos {cores} cœurs)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-fuchsia-300 px-2.5 py-0.5 rounded-lg bg-purple-950/50 border border-fuchsia-500/30">
                {convertThreads}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min={1}
              max={Math.min(cores, 16)}
              step={1}
              value={convertThreads}
              onChange={(e) => setConvertThreads(parseInt(e.target.value, 10))}
              className="flex-1 accent-fuchsia-500 cursor-pointer h-2 bg-purple-950 rounded-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-psychic-blade text-white font-bold text-xs font-sans tracking-wider"
          >
            Enregistrer & Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
