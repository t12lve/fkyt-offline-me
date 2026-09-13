import React from 'react';
import { Sliders, Sparkles, HardDriveDownload } from 'lucide-react';

export const QUALITY_OPTIONS = [
  { id: '320k', label: '320 kbps', badge: 'Ultra HQ', sub: 'Master CBR', savings: 'Plein débit' },
  { id: '256k', label: '256 kbps', badge: 'Très Haute', sub: 'CBR ~10%', savings: '-10% taille' },
  { id: '192k', label: '192 kbps', badge: 'Équilibré', sub: 'Idéal Mobile', savings: '-40% taille' },
  { id: '128k', label: '128 kbps', badge: 'Compact', sub: 'Éco Stock', savings: '-60% taille' },
  { id: 'V0', label: 'VBR V0', badge: 'Dynamique', sub: 'Variable ~245k', savings: '-25% taille' },
];

export function QualitySelector({ selectedQuality, onSelectQuality, disabled }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold tracking-wider text-purple-300 uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
          <span>Débit Audio & Compression</span>
        </label>
        <span className="text-[11px] font-mono text-purple-400/80 flex items-center gap-1">
          <HardDriveDownload className="w-3 h-3 text-pink-400 shrink-0" />
          <span>Actuel :</span>
          <strong className="text-pink-300 font-bold">{selectedQuality === 'V0' ? 'VBR V0' : selectedQuality}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {QUALITY_OPTIONS.map((opt) => {
          const isSelected = selectedQuality === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuality(opt.id)}
              className={`h-[78px] p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'bg-purple-900/50 border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/40'
                  : 'bg-psylocke-surface/70 border-purple-500/20 hover:border-purple-500/40 hover:bg-psylocke-surface/90'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-pink-500/25 to-transparent rounded-bl-full pointer-events-none" />
              )}
              
              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                <span className={`text-xs font-bold font-mono truncate ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
                )}
              </div>

              <div className="w-full min-w-0">
                <div className="flex items-center">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded truncate max-w-full inline-block ${
                    isSelected ? 'bg-pink-500/25 text-pink-200 border border-pink-500/30' : 'bg-purple-950/40 text-purple-400/80'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-[10px] text-purple-400/70 font-mono mt-0.5 truncate">
                  {opt.savings}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
