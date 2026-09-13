import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Copy, Trash2, Check } from 'lucide-react';

export function LogDrawer({ logs, onClearLogs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    if (!logs || logs.length === 0) return;
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-amber-300';
      case 'success': return 'text-emerald-400';
      case 'ytdlp': return 'text-fuchsia-300';
      case 'ffmpeg': return 'text-pink-300';
      default: return 'text-purple-300/80';
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl border-purple-500/20 overflow-hidden transition-all shadow-md shrink-0">
      {/* Header / Toggle bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3.5 py-1.5 bg-psylocke-surface/80 hover:bg-psylocke-surface cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-200">
            Journal d'Exécution & Debug
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/20">
            {logs.length} entrées
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isOpen && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg hover:bg-purple-800/40 text-purple-300 hover:text-white transition-colors"
                title="Copier les logs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                className="p-1 rounded-lg hover:bg-purple-800/40 text-purple-300 hover:text-red-400 transition-colors"
                title="Effacer les logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-purple-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-purple-400" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 bg-psylocke-darkest/95 border-t border-purple-500/20 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-purple-400/40 italic">Aucun log enregistré pour le moment.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2.5 leading-relaxed break-all">
                <span className="text-purple-400/50 shrink-0 select-none">
                  [{log.timestamp || '00:00:00'}]
                </span>
                <span className={`font-semibold shrink-0 uppercase text-[10px] px-1 rounded bg-purple-950/60 border border-purple-500/10 ${getLogColor(log.level)}`}>
                  {log.level}
                </span>
                <span className={getLogColor(log.level)}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
