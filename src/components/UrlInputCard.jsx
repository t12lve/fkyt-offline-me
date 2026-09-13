import React, { useState } from 'react';
import { 
  FolderOpen, 
  ClipboardPaste, 
  Loader2, 
  Link2, 
  AlertCircle, 
  PlusCircle, 
  ListPlus,
  Layers
} from 'lucide-react';
import { QualitySelector } from './QualitySelector';

export function UrlInputCard({
  url,
  setUrl,
  destinationDir,
  onSelectFolder,
  onAddToQueue,
  audioQuality,
  setAudioQuality,
  isInspecting,
  isDownloading,
  error
}) {
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Check if multiple URLs are present (split by lines or spaces)
  const urlsCount = url
    .split(/[\r\n\s]+/)
    .map(u => u.trim())
    .filter(u => u.startsWith('http')).length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch (e) {
      console.warn("Impossible d'accéder au presse-papiers :", e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && url && !isInspecting && !isDownloading) {
      e.preventDefault();
      onAddToQueue();
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 transition-all border-psylocke-border relative overflow-hidden shrink-0 shadow-psionic">
      {/* Background Subtle Psionic Energy Ribbon */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-purple-200 uppercase flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-pink-400" />
            <span>Ajouter une Playlist</span>
          </label>

          {urlsCount > 1 && (
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              {urlsCount} playlists détectées
            </span>
          )}
        </div>

        {/* URL Input Row with Paste Button */}
        <div className="relative flex items-center">
          {urlsCount > 1 ? (
            <textarea
              rows={2}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isInspecting}
              placeholder="Collez une ou plusieurs URLs (une par ligne)..."
              className="w-full bg-psylocke-surface/90 border border-purple-500/30 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs sm:text-sm text-purple-100 placeholder-purple-400/40 rounded-xl p-3 pr-24 transition-all outline-none font-mono resize-none"
            />
          ) : (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInspecting}
              placeholder="https://music.youtube.com/playlist?list=..."
              className="w-full h-11 bg-psylocke-surface/90 border border-purple-500/30 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs sm:text-sm text-purple-100 placeholder-purple-400/40 rounded-xl px-4 pr-24 transition-all outline-none font-mono"
            />
          )}

          {/* Paste Button */}
          <button
            type="button"
            onClick={handlePaste}
            disabled={isInspecting}
            className="absolute right-2 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200 font-medium flex items-center gap-1.5 transition-all hover:text-pink-300 disabled:opacity-40 cursor-pointer"
            title="Coller depuis le presse-papier"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-pink-400" />
            <span>{copiedNotification ? 'Collé !' : 'Coller'}</span>
          </button>
        </div>

        {/* Quality Selector Section */}
        <div className="pt-0.5">
          <QualitySelector
            selectedQuality={audioQuality}
            onSelectQuality={setAudioQuality}
            disabled={isDownloading}
          />
        </div>

        {/* Destination Folder Row */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300/80 uppercase mb-1.5">
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
              Dossier de destination racine
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex-1 h-10 bg-psylocke-darkest/80 border border-purple-500/20 rounded-xl px-3 flex items-center text-xs text-purple-300/80 font-mono truncate min-w-0"
              title={destinationDir}
            >
              <span className="truncate">{destinationDir || 'Dossier Musique par défaut'}</span>
            </div>
            <button
              type="button"
              onClick={onSelectFolder}
              disabled={isInspecting || isDownloading}
              className="h-10 px-3.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-xs text-purple-200 hover:text-white font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-pink-400" />
              <span>Changer</span>
            </button>
          </div>
        </div>

        {/* Add to Queue Action Button */}
        <button
          type="button"
          onClick={onAddToQueue}
          disabled={!url || isInspecting}
          className={`w-full h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            url && !isInspecting
              ? 'btn-psychic-blade text-white shadow-psionic cursor-pointer'
              : 'bg-purple-950/40 text-purple-400/50 border border-purple-500/20 cursor-not-allowed'
          }`}
        >
          {isInspecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-pink-200" />
              <span>Résolution de la playlist...</span>
            </>
          ) : urlsCount > 1 ? (
            <>
              <ListPlus className="w-4 h-4 text-pink-200" />
              <span>Ajouter {urlsCount} playlists à la file</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 text-pink-200" />
              <span>+ Ajouter à la file d'attente</span>
            </>
          )}
        </button>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UrlInputCard;
