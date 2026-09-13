import React, { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { UrlInputCard } from './components/UrlInputCard';
import { PlaylistQueue } from './components/PlaylistQueue';
import { PlaylistOverview } from './components/PlaylistOverview';
import { ProgressBar } from './components/ProgressBar';
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

      {/* 3. Main Scrollable App Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5 max-w-6xl w-full mx-auto flex flex-col">
        {/* Header with Navigation Tabs & Performance Specs Badge */}
        <Header 
          binaryStatus={binaryStatus} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          systemSpecs={systemSpecs}
          downloadThreads={downloadThreads}
          onOpenThreadModal={() => setIsThreadModalOpen(true)}
        />

        {/* Tab 1: Téléchargeur Playlists */}
        {activeTab === 'downloader' && (
          <>
            {/* URL Input & Add to Queue + Quality Selector */}
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

            {/* Multi-Playlist Queue List */}
            {queue && queue.length > 0 && (
              <PlaylistQueue
                queue={queue}
                currentQueueIndex={currentQueueIndex}
                onSelectQueueItem={selectQueueItem}
                onRemoveFromQueue={removeFromQueue}
                onOpenPlaylistFolder={(p) => openFolder(p)}
                onClearQueue={clearQueue}
                isQueueRunning={isQueueRunning}
              />
            )}

            {/* Currently Selected Playlist Overview */}
            {playlist && (
              <PlaylistOverview 
                playlist={playlist} 
                fullOutputPath={fullOutputPath} 
              />
            )}

            {/* Progress Bar (Dual: Active Playlist + Queue) */}
            {(isDownloading || isQueueRunning || progress.completed_tracks > 0) && (
              <ProgressBar
                progress={progress}
                totalTracks={tracks.length}
                isDownloading={isDownloading || isQueueRunning}
                queue={queue}
                currentQueueIndex={currentQueueIndex}
              />
            )}

            {/* Selected Playlist Tracks Queue */}
            {tracks && tracks.length > 0 && (
              <TrackList tracks={tracks} />
            )}

            {/* Action Controls */}
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
          </>
        )}

        {/* Tab 2: Compresseur & Gain d'Espace */}
        {activeTab === 'compressor' && (
          <AudioCompressorTab 
            onOpenFolder={openFolder} 
            convertThreads={convertThreads} 
          />
        )}

        {/* Debug Logs Drawer (collapsible) */}
        <div className="mt-auto pt-4 pb-2">
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
