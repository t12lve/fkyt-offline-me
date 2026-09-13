import React from 'react';
import { Sliders, Sparkles, HardDriveDownload } from 'lucide-react';

export const QUALITY_OPTIONS = [
  { id: '320k', label: '320 kbps', badge: 'Ultra HQ', desc: 'Fidélité maximale' },
  { id: '256k', label: '256 kbps', badge: 'Très Haute', desc: '-10% taille' },
  { id: '192k', label: '192 kbps', badge: 'Équilibré', desc: 'Idéal baladeur' },
  { id: '128k', label: '128 kbps', badge: 'Compact', desc: 'Gain -60%' },
  { id: 'V0', label: 'VBR V0', badge: 'Variable', desc: 'Dynamique' },
];

export function QualitySelector({ selectedQuality, onSelectQuality, disabled }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold tracking-wider text-purple-200 uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>Qualité Audio & Débit</span>
        </label>
        <span className="text-xs font-mono text-purple-400/90 flex items-center gap-1.5">
          <HardDriveDownload className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>Actuel :</span>
          <strong className="text-pink-300 font-bold px-2 py-0.5 rounded-md bg-pink-950/40 border border-pink-500/30">
            {selectedQuality === 'V0' ? 'VBR V0' : selectedQuality}
          </strong>
        </span>
      </div>

      {/* 5 Quality Cards with ample breathing room */}
      <div className="grid grid-cols-5 gap-2">
        {QUALITY_OPTIONS.map((opt) => {
          const isSelected = selectedQuality === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuality(opt.id)}
              className={`py-2 px-2 rounded-xl border text-center transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1 min-w-0 ${
                isSelected
                  ? 'bg-purple-900/60 border-pink-500/90 shadow-[0_0_15px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/40'
                  : 'bg-psylocke-surface/70 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/40'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-bl from-pink-500/30 to-transparent rounded-full pointer-events-none" />
              )}
              
              <div className="flex items-center justify-center gap-1 w-full">
                <span className={`text-xs font-bold font-mono whitespace-nowrap ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <Sparkles className="w-3 h-3 text-pink-400 animate-pulse shrink-0" />
                )}
              </div>

              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded whitespace-nowrap ${
                isSelected ? 'bg-pink-500/30 text-pink-200 border border-pink-500/40 font-bold' : 'bg-purple-950/50 text-purple-400/80'
              }`}>
                {opt.badge}
              </span>

              <span className="text-[10px] text-purple-400/70 font-mono whitespace-nowrap">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QualitySelector;
