import React, { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { UrlInputCard } from './components/UrlInputCard';
import { PlaylistQueue } from './components/PlaylistQueue';
import { PlaylistOverview } from './components/PlaylistOverview';
import { TrackList } from './components/TrackList';
import { ActionFooter } from './components/ActionFooter';
import { LogDrawer } from './components/LogDrawer';
import { AudioCompressorTab } from './components/AudioCompressorTab';
import { ThreadConfigModal } from './components/ThreadConfigModal';
import { useDownloader } from './hooks/useDownloader';

export function App() {
  const [activeTab, setActiveTab] = useState('downloader');
  const [url, setUrl] = useState('');
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);

  const {
    binaryStatus,
    destinationDir,
    systemSpecs,
    downloadThreads,
    setDownloadThreads,
    convertThreads,
    setConvertThreads,
    audioQuality,
    setAudioQuality,
    queue,
    currentQueueIndex,
    isQueueRunning,
    playlist,
    tracks,
    progress,
    logs,
    isInspecting,
    isDownloading,
    hasCompleted,
    error,
    fullOutputPath,
    selectFolder,
    addToQueue,
    removeFromQueue,
    clearQueue,
    selectQueueItem,
    startQueue,
    cancelDownload,
    openFolder,
    resetAll,
    clearLogs,
  } = useDownloader();

  const handleAddToQueue = async () => {
    if (url.trim()) {
      const currentInput = url.trim();
      setUrl('');
      await addToQueue(currentInput);
    }
  };

  const handleStart = () => {
    startQueue();
  };

  const handleReset = () => {
    setUrl('');
    resetAll();
  };

  const canStart = queue.length > 0 && !isDownloading && !isQueueRunning;

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      onDragOver={(e) => e.preventDefault()}
      className="relative h-screen w-screen bg-psylocke-bg text-psylocke-text flex flex-col overflow-hidden select-none"
    >
      {/* 1. Native Windows Frameless TitleBar */}
      <TitleBar />

      {/* 2. Psionic Ambient Background Glows */}
      <div className="fixed top-12 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 3. Main Desktop Workstation Workspace (Fixed 2 Columns, No Global Scroll) */}
      <div className="flex-1 min-h-0 px-4 pt-2 pb-3 sm:px-6 md:px-8 flex flex-col overflow-hidden">
        {/* Header with Navigation Tabs & Performance Specs Badge */}
        <Header 
          binaryStatus={binaryStatus} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          systemSpecs={systemSpecs}
          downloadThreads={downloadThreads}
          onOpenThreadModal={() => setIsThreadModalOpen(true)}
        />

        {/* Tab 1: Téléchargeur Playlists en 2 Colonnes Fixes */}
        {activeTab === 'downloader' && (
          <div className="flex-1 min-h-0 flex gap-4 lg:gap-5 overflow-hidden">
            {/* Colonne GAUCHE (Spacieuse ~460px - 530px) : Blocs Durs Saisie, Queue, Actions */}
            <aside className="w-[460px] lg:w-[490px] xl:w-[530px] flex flex-col gap-3 shrink-0 h-full overflow-hidden">
              {/* Bloc Dur 1: Saisie URL & Configuration */}
              <UrlInputCard
                url={url}
                setUrl={setUrl}
                destinationDir={destinationDir}
                onSelectFolder={selectFolder}
                onInspectPlaylist={handleAddToQueue}
                onAddToQueue={handleAddToQueue}
                audioQuality={audioQuality}
                setAudioQuality={setAudioQuality}
                isInspecting={isInspecting}
                isDownloading={isDownloading || isQueueRunning}
                error={error}
              />

              {/* Bloc Dur 2: File d'Attente Playlists (Bloc permanent avec état vide anticipé) */}
              <PlaylistQueue
                queue={queue}
                currentQueueIndex={currentQueueIndex}
                onSelectQueueItem={selectQueueItem}
                onRemoveFromQueue={removeFromQueue}
                onOpenPlaylistFolder={(p) => openFolder(p)}
                onClearQueue={clearQueue}
                isQueueRunning={isQueueRunning}
              />

              {/* Bloc Dur 3: Contrôles & Actions (Ancré au bas de la colonne gauche) */}
              <ActionFooter
                canStart={canStart}
                isDownloading={isDownloading}
                isQueueRunning={isQueueRunning}
                hasCompleted={hasCompleted}
                queueLength={queue.length}
                onStartQueue={handleStart}
                onCancelDownload={cancelDownload}
                onOpenFolder={() => openFolder()}
                onReset={handleReset}
              />
            </aside>

            {/* Colonne DROITE (Flexible, remplit tout l'espace restant) : Blocs Durs Overview + Workstation TrackList */}
            <main className="flex-1 min-w-0 flex flex-col gap-3 h-full overflow-hidden">
              {/* Bloc Dur 1: Playlist Active & Progression en direct (Bloc permanent avec état vide anticipé) */}
              <PlaylistOverview 
                playlist={playlist} 
                fullOutputPath={fullOutputPath}
                progress={progress}
                totalTracks={tracks.length}
                isDownloading={isDownloading || isQueueRunning}
                queue={queue}
                currentQueueIndex={currentQueueIndex}
              />

              {/* Bloc Dur 2: Workstation des Titres de la Playlist (Remplit la hauteur restante avec scroll interne) */}
              <TrackList 
                tracks={tracks} 
                isDownloading={isDownloading || isQueueRunning}
              />
            </main>
          </div>
        )}

        {/* Tab 2: Compresseur & Gain d'Espace */}
        {activeTab === 'compressor' && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            <AudioCompressorTab 
              onOpenFolder={openFolder} 
              convertThreads={convertThreads} 
            />
          </div>
        )}

        {/* Docked Debug Log Drawer (Bouton pliable en bas, n'altère pas la grille) */}
        <div className="mt-2 shrink-0">
          <LogDrawer logs={logs} onClearLogs={clearLogs} />
        </div>
      </div>

      {/* 4. Native Desktop Bottom Status Bar */}
      <StatusBar 
        binaryStatus={binaryStatus} 
        destinationDir={destinationDir}
        downloadThreads={downloadThreads}
        convertThreads={convertThreads}
      />

      {/* 5. Performance & Thread Configuration Modal */}
      <ThreadConfigModal
        isOpen={isThreadModalOpen}
        onClose={() => setIsThreadModalOpen(false)}
        systemSpecs={systemSpecs}
        downloadThreads={downloadThreads}
        setDownloadThreads={setDownloadThreads}
        convertThreads={convertThreads}
        setConvertThreads={setConvertThreads}
      />
    </div>
  );
}

export default App;
