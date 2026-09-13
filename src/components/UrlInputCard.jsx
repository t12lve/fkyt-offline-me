import React, { useState } from 'react';
import { 
  FolderOpen, 
  ClipboardPaste, 
  Sparkles, 
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
  onInspectPlaylist,
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
    <div className="w-full glass-panel glass-panel-hover rounded-2xl p-6 mb-6 transition-all border-psylocke-border relative overflow-hidden">
      {/* Background Subtle Psionic Energy Ribbon */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-4">
        {/* URL Input Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold tracking-wider text-purple-300 uppercase flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-pink-400" />
              Lien(s) de Playlist YouTube / YouTube Music
            </label>

            {urlsCount > 1 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1 font-semibold">
                <Layers className="w-3 h-3 text-pink-400" />
                {urlsCount} playlists détectées (ajout groupé)
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            {urlsCount > 1 ? (
              <textarea
                rows={3}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isInspecting}
                placeholder="Collez une ou plusieurs URLs de playlists (une par ligne)..."
                className="w-full bg-psylocke-surface/90 border border-purple-500/30 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm text-purple-100 placeholder-purple-400/40 rounded-xl p-3 pr-24 transition-all outline-none font-mono resize-none"
              />
            ) : (
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInspecting}
                placeholder="https://music.youtube.com/playlist?list=... (ou collez plusieurs liens)"
                className="w-full bg-psylocke-surface/90 border border-purple-500/30 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm text-purple-100 placeholder-purple-400/40 rounded-xl px-4 py-3.5 pr-28 transition-all outline-none font-mono"
              />
            )}

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              disabled={isInspecting}
              className="absolute right-2 top-2.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs text-purple-200 font-medium flex items-center gap-1.5 transition-all hover:text-pink-300 disabled:opacity-40"
              title="Coller depuis le presse-papier"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-pink-400" />
              <span>{copiedNotification ? 'Collé !' : 'Coller'}</span>
            </button>
          </div>
        </div>

        {/* Quality Selector Section */}
        <div className="pt-1 pb-1">
          <QualitySelector
            selectedQuality={audioQuality}
            onSelectQuality={setAudioQuality}
            disabled={isDownloading}
          />
        </div>

        {/* Target Folder & Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end pt-1">
          {/* Destination Folder Selector */}
          <div className="lg:col-span-7">
            <label className="block text-xs font-semibold tracking-wider text-purple-300 uppercase mb-2 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Dossier de Téléchargement Racine</span>
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 h-11 bg-psylocke-darkest/70 border border-purple-500/20 rounded-xl px-3.5 flex items-center text-xs text-purple-300/80 font-mono truncate min-w-0"
                title={destinationDir}
              >
                <span className="truncate">{destinationDir || 'Dossier Musique par défaut'}</span>
              </div>
              <button
                type="button"
                onClick={onSelectFolder}
                disabled={isInspecting || isDownloading}
                className="h-11 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-xs text-purple-200 hover:text-white font-medium flex items-center gap-2 transition-all disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-pink-400" />
                <span>Parcourir</span>
              </button>
            </div>
          </div>

          {/* Add to Queue Button */}
          <div className="lg:col-span-5 flex items-center gap-2">
            <button
              type="button"
              onClick={onAddToQueue}
              disabled={!url || isInspecting}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                url && !isInspecting
                  ? 'btn-psychic-blade text-white shadow-psionic cursor-pointer'
                  : 'bg-purple-950/40 text-purple-400/50 border border-purple-500/20 cursor-not-allowed'
              }`}
            >
              {isInspecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-pink-200" />
                  <span>Résolution...</span>
                </>
              ) : urlsCount > 1 ? (
                <>
                  <ListPlus className="w-4 h-4 text-pink-200" />
                  <span>Ajouter les {urlsCount} playlists à la file</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-pink-200" />
                  <span>+ Ajouter à la file d'attente</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
