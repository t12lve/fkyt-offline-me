import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Zap, Copy } from 'lucide-react';

const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let timer;
    async function checkMax() {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const max = await invoke('app_is_maximized');
          setIsMaximized(Boolean(max));
        } catch {
          // safe ignore
        }
      }
    }

    if (isTauri) {
      checkMax();
      timer = setInterval(checkMax, 1500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const handleMinimize = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('app_minimize');
      } catch (e) {
        console.error('Erreur minimiser:', e);
      }
    }
  };

  const handleToggleMaximize = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('app_toggle_maximize');
        setIsMaximized((prev) => !prev);
      } catch (e) {
        console.error('Erreur maximiser:', e);
      }
    }
  };

  const handleClose = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('app_close');
      } catch (e) {
        console.error('Erreur fermer:', e);
      }
    }
  };

  return (
    <div 
      data-tauri-drag-region 
      onDoubleClick={handleToggleMaximize}
      className="w-full h-8 bg-[#07050d] select-none flex items-center justify-between border-b border-purple-500/20 px-2.5 z-50 text-purple-200 sticky top-0"
    >
      {/* Left: App Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none" data-tauri-drag-region>
        <div className="w-4 h-4 rounded bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center p-0.5">
          <Zap className="w-3 h-3 text-pink-200 fill-pink-300" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-purple-300 font-sans">
          fkYT <span className="font-normal text-fuchsia-400">offline me</span>
        </span>
        <span className="text-[10px] font-mono text-purple-500/70 ml-1">
          v2.2 Native Desktop
        </span>
      </div>

      {/* Center: Draggable Area */}
      <div className="flex-1 h-full flex items-center justify-center pointer-events-none" data-tauri-drag-region>
        <span className="text-[10px] font-mono text-purple-400/30 uppercase tracking-widest hidden md:inline">
          Psylocke High-Fidelity Audio Engine
        </span>
      </div>

      {/* Right: Native Window Action Controls */}
      <div className="flex items-center h-full -mr-2.5" onClick={(e) => e.stopPropagation()}>
        {/* Minimize */}
        <button
          type="button"
          onClick={handleMinimize}
          className="w-11 h-8 flex items-center justify-center hover:bg-purple-900/40 text-purple-300 hover:text-white transition-colors"
          title="Minimiser"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          type="button"
          onClick={handleToggleMaximize}
          className="w-11 h-8 flex items-center justify-center hover:bg-purple-900/40 text-purple-300 hover:text-white transition-colors"
          title={isMaximized ? "Niveau inférieur" : "Agrandir"}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3 rotate-180" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="w-11 h-8 flex items-center justify-center hover:bg-red-600 text-purple-300 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
