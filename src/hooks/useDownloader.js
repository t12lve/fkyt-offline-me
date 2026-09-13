import { useState, useEffect, useCallback, useRef } from 'react';

// Safely check if running inside Tauri
const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

export function useDownloader() {
  // Binary Status & Root Destination Directory
  const [binaryStatus, setBinaryStatus] = useState({ ytdlp_available: false, ffmpeg_available: false });
  const [destinationDir, setDestinationDir] = useState('');

  // Hardware Specs & Threads Setting
  const [systemSpecs, setSystemSpecs] = useState({
    cpu_model: 'Processeur Détecté',
    logical_cores: 4,
    total_ram_gb: 16,
    recommended_download_threads: 3,
    recommended_convert_threads: 6,
  });
  const [downloadThreads, setDownloadThreads] = useState(3);
  const [convertThreads, setConvertThreads] = useState(6);

  // Audio Quality Setting
  const [audioQuality, setAudioQuality] = useState('320k');

  // Multi-playlist Queue State
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isQueueRunning, setIsQueueRunning] = useState(false);

  // Active Playlist View State
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState({
    completed_tracks: 0,
    total_tracks: 0,
    current_speed: '',
    current_active_title: '',
  });

  const [logs, setLogs] = useState([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [error, setError] = useState(null);

  // References to keep event handlers fresh without re-binding
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const currentQueueIndexRef = useRef(currentQueueIndex);
  currentQueueIndexRef.current = currentQueueIndex;
  const isQueueRunningRef = useRef(isQueueRunning);
  isQueueRunningRef.current = isQueueRunning;
  const destinationDirRef = useRef(destinationDir);
  destinationDirRef.current = destinationDir;

  const fullOutputPath = playlist?.output_folder || (destinationDir && playlist?.title ? `${destinationDir}\\${playlist.title.replace(/[<>:"/\\|?*]/g, '_')}` : destinationDir);

  const addLog = useCallback((message, level = 'info') => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev.slice(-499), { timestamp, level, message }]);
  }, []);

  // Initialize: Check Binaries & Fetch default Music folder
  useEffect(() => {
    async function init() {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const status = await invoke('check_binaries');
          setBinaryStatus(status);
          addLog(`Binaires détectés : yt-dlp=${status.ytdlp_available}, ffmpeg=${status.ffmpeg_available}`, 'info');

          const defaultDir = await invoke('get_default_music_dir');
          setDestinationDir(defaultDir);
          addLog(`Dossier racine par défaut : ${defaultDir}`, 'info');

          const specs = await invoke('get_system_specs');
          if (specs) {
            setSystemSpecs(specs);
            setDownloadThreads(specs.recommended_download_threads || 3);
            setConvertThreads(specs.recommended_convert_threads || 6);
            addLog(`PC détecté : ${specs.logical_cores} Cœurs, ${specs.total_ram_gb} Go RAM. Recommandé : ${specs.recommended_download_threads} Th.`, 'success');
          }
        } catch (err) {
          console.error('Erreur initialisation Tauri:', err);
          addLog(`Erreur init: ${err}`, 'error');
        }
      } else {
        setBinaryStatus({ ytdlp_available: true, ffmpeg_available: true });
        setDestinationDir('C:\\Users\\MockUser\\Music\\fkYT offline me');
        addLog('Mode aperçu Web : Tauri non détecté.', 'warn');
      }
    }
    init();
  }, [addLog]);

  // Method to start downloading a specific playlist from queue by index
  const startDownloadForPlaylist = useCallback(async (index) => {
    const currentList = queueRef.current;
    const targetItem = currentList[index];
    if (!targetItem) return;

    setCurrentQueueIndex(index);
    setPlaylist(targetItem);
    setTracks(targetItem.entries || []);
    setIsDownloading(true);
    setHasCompleted(false);
    setError(null);

    // Update item status in queue
    setQueue((prev) =>
      prev.map((q, i) => (i === index ? { ...q, status: 'Downloading' } : q))
    );

    addLog(`[Queue #${index + 1}] Démarrage de l'extraction : "${targetItem.title}"...`, 'info');

    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_download', {
          url: targetItem.url,
          destinationDir: destinationDirRef.current,
          playlistTitle: targetItem.title,
          tracks: targetItem.entries,
          audioQuality,
          threadsCount: downloadThreads,
        });
      } catch (err) {
        const errMsg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
        setError(`Erreur de téléchargement: ${errMsg}`);
        addLog(`Erreur: ${errMsg}`, 'error');
        setQueue((prev) =>
          prev.map((q, i) => (i === index ? { ...q, status: 'Error', error_message: errMsg } : q))
        );
        setIsDownloading(false);
      }
    } else {
      // Mock simulation for browser
      let completedCount = 0;
      for (let i = 0; i < (targetItem.entries?.length || 0); i++) {
        setTracks((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: 'Downloading', progress: 50, speed: '2.5 MiB/s' } : t))
        );
        await new Promise((r) => setTimeout(r, 400));
        setTracks((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: 'Converting', progress: 95 } : t))
        );
        await new Promise((r) => setTimeout(r, 300));
        completedCount++;
        setTracks((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: 'Completed', progress: 100 } : t))
        );
        setProgress({
          completed_tracks: completedCount,
          total_tracks: targetItem.entries.length,
          current_speed: '2.5 MiB/s',
          current_active_title: targetItem.entries[i].title,
        });
      }

      // Simulate completion event
      setQueue((prev) =>
        prev.map((q, i) => (i === index ? { ...q, status: 'Completed' } : q))
      );
      addLog(`[Queue #${index + 1}] Playlist "${targetItem.title}" terminée !`, 'success');

      // Check next
      const nextPendingIndex = currentList.findIndex((q, i) => i > index && q.status === 'Pending');
      if (nextPendingIndex !== -1 && isQueueRunningRef.current) {
        setTimeout(() => startDownloadForPlaylist(nextPendingIndex), 1000);
      } else {
        setIsDownloading(false);
        setIsQueueRunning(false);
        setHasCompleted(true);
      }
    }
  }, [addLog]);

  // Setup Event Listeners from Tauri
  useEffect(() => {
    if (!isTauri) return;

    let unlistenProgress, unlistenTrack, unlistenLog, unlistenFinished;

    async function setupListeners() {
      const { listen } = await import('@tauri-apps/api/event');

      unlistenProgress = await listen('download-progress', (event) => {
        setProgress(event.payload);
      });

      unlistenTrack = await listen('track-status', (event) => {
        const payload = event.payload;
        setTracks((prevTracks) =>
          prevTracks.map((t) => (t.id === payload.id ? { ...t, ...payload } : t))
        );
      });

      unlistenLog = await listen('download-log', (event) => {
        const { timestamp, level, message } = event.payload;
        setLogs((prev) => [...prev.slice(-499), { timestamp, level, message }]);
      });

      unlistenFinished = await listen('download-finished', (event) => {
        const finishedIndex = currentQueueIndexRef.current;
        const currentList = queueRef.current;

        // Mark current playlist as Completed
        setQueue((prev) =>
          prev.map((q, i) => (i === finishedIndex ? { ...q, status: 'Completed' } : q))
        );
        addLog(`Playlist #${finishedIndex + 1} terminée avec succès !`, 'success');

        // Check if there is another pending playlist in the queue
        if (isQueueRunningRef.current) {
          const nextIndex = currentList.findIndex((q, i) => i > finishedIndex && q.status === 'Pending');
          if (nextIndex !== -1) {
            addLog(`Passage automatique à la playlist #${nextIndex + 1} : "${currentList[nextIndex].title}"...`, 'info');
            setTimeout(() => {
              startDownloadForPlaylist(nextIndex);
            }, 1000);
            return;
          }
        }

        // Entire queue finished
        setIsDownloading(false);
        setIsQueueRunning(false);
        setHasCompleted(true);
        addLog('Toutes les playlists de la file ont été traitées !', 'success');
      });
    }

    setupListeners();

    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenTrack) unlistenTrack();
      if (unlistenLog) unlistenLog();
      if (unlistenFinished) unlistenFinished();
    };
  }, [addLog, startDownloadForPlaylist]);

  // Folder selection via Tauri dialog
  const selectFolder = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const selected = await invoke('select_folder');
        if (selected) {
          setDestinationDir(selected);
          addLog(`Nouveau dossier racine sélectionné : ${selected}`, 'info');
        }
      } catch (err) {
        addLog(`Erreur choix dossier: ${err}`, 'error');
      }
    }
  };

  // Add one or multiple URLs to the queue
  const addToQueue = async (urlInput) => {
    if (!urlInput || !urlInput.trim()) return;

    const urls = urlInput
      .split(/[\r\n\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    if (urls.length === 0) return;

    setIsInspecting(true);
    setError(null);
    addLog(`Résolution de ${urls.length} playlist(s)...`, 'ytdlp');

    for (const singleUrl of urls) {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const result = await invoke('inspect_playlist', {
            url: singleUrl,
            destinationDir,
          });

          const queueItem = {
            ...result,
            url: singleUrl,
            status: 'Pending',
          };

          setQueue((prev) => {
            const next = [...prev, queueItem];
            // If it's the only item, set active view
            if (next.length === 1) {
              setPlaylist(queueItem);
              setTracks(queueItem.entries || []);
              setCurrentQueueIndex(0);
            }
            return next;
          });

          addLog(`Ajoutée à la file : "${result.title}" (${result.entries?.length} pistes)`, 'success');
        } catch (err) {
          const errMsg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
          setError(`Erreur lors de l'ajout de ${singleUrl} : ${errMsg}`);
          addLog(`Erreur: ${errMsg}`, 'error');
        }
      } else {
        // Mock preview for web
        const mockIdx = queueRef.current.length + 1;
        const mockItem = {
          id: `mock_${mockIdx}`,
          url: singleUrl,
          title: `Synthwave Pack Vol. ${mockIdx}`,
          uploader: 'Cyber Records',
          thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
          output_folder: `${destinationDir}\\Synthwave Pack Vol. ${mockIdx}`,
          status: 'Pending',
          entries: [
            { id: `${mockIdx}_1`, title: `Cyber Track ${mockIdx}-1`, duration: 210, status: 'Pending' },
            { id: `${mockIdx}_2`, title: `Cyber Track ${mockIdx}-2`, duration: 185, status: 'Pending' },
          ],
        };

        setQueue((prev) => {
          const next = [...prev, mockItem];
          if (next.length === 1) {
            setPlaylist(mockItem);
            setTracks(mockItem.entries);
            setCurrentQueueIndex(0);
          }
          return next;
        });
        addLog(`[Mock] Ajouté : "${mockItem.title}"`, 'success');
      }
    }

    setIsInspecting(false);
  };

  // Remove single item from queue
  const removeFromQueue = (index) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (currentQueueIndex >= next.length && next.length > 0) {
        setCurrentQueueIndex(next.length - 1);
        setPlaylist(next[next.length - 1]);
        setTracks(next[next.length - 1]?.entries || []);
      } else if (next.length === 0) {
        setPlaylist(null);
        setTracks([]);
      }
      return next;
    });
    addLog(`Playlist retirée de la file.`, 'info');
  };

  // Clear entire queue
  const clearQueue = () => {
    if (isDownloading || isQueueRunning) return;
    setQueue([]);
    setPlaylist(null);
    setTracks([]);
    setProgress({ completed_tracks: 0, total_tracks: 0, current_speed: '', current_active_title: '' });
    setHasCompleted(false);
    addLog('File d\'attente vidée.', 'info');
  };

  // Select a playlist from queue to view its tracks
  const selectQueueItem = (index) => {
    const item = queue[index];
    if (item) {
      setCurrentQueueIndex(index);
      setPlaylist(item);
      setTracks(item.entries || []);
    }
  };

  // Start processing the entire queue
  const startQueue = async () => {
    if (queue.length === 0) return;
    setIsQueueRunning(true);

    // Find first pending playlist
    const firstPending = queue.findIndex((q) => q.status === 'Pending');
    const targetIdx = firstPending !== -1 ? firstPending : 0;

    startDownloadForPlaylist(targetIdx);
  };

  // Cancel download / stop queue
  const cancelDownload = async () => {
    setIsQueueRunning(false);
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('cancel_download');
        addLog('Téléchargement interrompu par l\'utilisateur.', 'warn');
      } catch (err) {
        addLog(`Erreur annulation: ${err}`, 'error');
      }
    }
    setIsDownloading(false);
  };

  // Open folder in Windows Explorer
  const openFolder = async (customPath) => {
    const target = customPath || fullOutputPath || destinationDir;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_folder', { path: target });
        addLog(`Explorateur ouvert sur : ${target}`, 'info');
      } catch (err) {
        addLog(`Impossible d'ouvrir le dossier: ${err}`, 'error');
      }
    } else {
      alert(`Ouvrirait le dossier : ${target}`);
    }
  };

  const resetAll = () => {
    clearQueue();
    setError(null);
  };

  return {
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
    clearLogs: () => setLogs([]),
  };
}
