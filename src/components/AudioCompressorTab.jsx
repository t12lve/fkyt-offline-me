import React, { useState, useEffect } from 'react';
import { 
  FileAudio, 
  FolderOpen, 
  HardDrive, 
  Sparkles, 
  Trash2, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FolderCheck, 
  TrendingDown, 
  Zap,
  Layers,
  FileCheck,
  FolderTree,
  ExternalLink
} from 'lucide-react';
import { formatBytes } from '../utils/formatting';

const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

const COMPRESSION_PRESETS = [
  { id: '192k', label: '192 kbps', badge: 'Optimal', estSavings: '~40%', desc: 'Excellente fidélité musicale' },
  { id: '128k', label: '128 kbps', badge: 'Recommandé', estSavings: '~60%', desc: 'Idéal smartphones & baladeurs' },
  { id: '96k', label: '96 kbps', badge: 'Voix & Podcast', estSavings: '~70%', desc: 'Très léger, spoken word' },
  { id: '64k', label: '64 kbps', badge: 'Poids Plume', estSavings: '~80%', desc: 'Gain d\'espace maximal' },
];

export function AudioCompressorTab({ onOpenFolder, convertThreads = 6 }) {
  const [files, setFiles] = useState([]);
  const [targetBitrate, setTargetBitrate] = useState('128k');
  const [customOutputDir, setCustomOutputDir] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [createdFolders, setCreatedFolders] = useState([]);
  const [progress, setProgress] = useState({
    completed_files: 0,
    total_files: 0,
    total_original_bytes: 0,
    total_final_bytes: 0,
  });

  // Calculate totals
  const totalOrigBytes = files.reduce((acc, f) => acc + (f.original_size_bytes || 0), 0);
  const totalFinalBytes = files.reduce((acc, f) => acc + (f.final_size_bytes || 0), 0);
  const completedCount = files.filter(f => f.status === 'Completed').length;
  const savedBytes = totalFinalBytes > 0 && totalOrigBytes > totalFinalBytes ? totalOrigBytes - totalFinalBytes : 0;
  const savingsPercent = totalOrigBytes > 0 && totalFinalBytes > 0 ? Math.round((savedBytes / totalOrigBytes) * 100) : 0;

  // Group files by source folder / album
  const groupedFiles = files.reduce((acc, file) => {
    const key = file.folder_name || 'Dossier Source';
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedFiles);

  // Listen to Tauri events for compression progress
  useEffect(() => {
    if (!isTauri) return;

    let unlistenUpdate, unlistenProgress, unlistenFinished;

    async function setupListeners() {
      const { listen } = await import('@tauri-apps/api/event');

      unlistenUpdate = await listen('compress-file-update', (event) => {
        const updated = event.payload;
        setFiles((prev) =>
          prev.map((f) => (f.path === updated.path ? { ...f, ...updated } : f))
        );
      });

      unlistenProgress = await listen('compress-progress', (event) => {
        setProgress(event.payload);
      });

      unlistenFinished = await listen('compress-finished', (event) => {
        const payload = event.payload;
        setIsCompressing(false);
        setHasCompleted(true);
        if (payload.created_folders) {
          setCreatedFolders(payload.created_folders);
        }
      });
    }

    setupListeners();

    return () => {
      if (unlistenUpdate) unlistenUpdate();
      if (unlistenProgress) unlistenProgress();
      if (unlistenFinished) unlistenFinished();
    };
  }, []);

  // Pick individual audio files
  const handlePickFiles = async () => {
    if (isTauri) {
      try {
        setIsScanning(true);
        const { invoke } = await import('@tauri-apps/api/core');
        const pickedPaths = await invoke('pick_audio_files');
        if (pickedPaths && pickedPaths.length > 0) {
          const scanned = await invoke('scan_local_audio', { paths: pickedPaths });
          setFiles((prev) => {
            const existingPaths = new Set(prev.map((f) => f.path));
            const newFiles = scanned.filter((f) => !existingPaths.has(f.path));
            return [...prev, ...newFiles];
          });
        }
      } catch (err) {
        console.error('Erreur sélection fichiers:', err);
      } finally {
        setIsScanning(false);
      }
    } else {
      // Mock files for preview with 2 distinct albums
      const mockList = [
        { path: 'C:\\Music\\Synthwave 80s\\01_Track.wav', filename: '01_Track.wav', folder_name: 'Synthwave 80s', original_size_bytes: 48500000, status: 'Pending' },
        { path: 'C:\\Music\\Synthwave 80s\\02_Solo.flac', filename: '02_Solo.flac', folder_name: 'Synthwave 80s', original_size_bytes: 32400000, status: 'Pending' },
        { path: 'C:\\Music\\Cyberpunk OST\\01_City.flac', filename: '01_City.flac', folder_name: 'Cyberpunk OST', original_size_bytes: 38800000, status: 'Pending' },
        { path: 'C:\\Music\\Cyberpunk OST\\02_Neon.mp3', filename: '02_Neon.mp3', folder_name: 'Cyberpunk OST', original_size_bytes: 11200000, status: 'Pending' },
      ];
      setFiles((prev) => [...prev, ...mockList]);
    }
  };

  // Pick a whole directory to scan
  const handlePickFolder = async () => {
    if (isTauri) {
      try {
        setIsScanning(true);
        const { invoke } = await import('@tauri-apps/api/core');
        const folder = await invoke('select_folder');
        if (folder) {
          const scanned = await invoke('scan_local_audio', { paths: [folder] });
          setFiles((prev) => {
            const existingPaths = new Set(prev.map((f) => f.path));
            const newFiles = scanned.filter((f) => !existingPaths.has(f.path));
            return [...prev, ...newFiles];
          });
        }
      } catch (err) {
        console.error('Erreur scan dossier:', err);
      } finally {
        setIsScanning(false);
      }
    } else {
      handlePickFiles();
    }
  };

  // Pick custom output directory
  const handlePickOutputDir = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const folder = await invoke('select_folder');
        if (folder) {
          setCustomOutputDir(folder);
        }
      } catch (err) {
        console.error('Erreur choix dossier:', err);
      }
    }
  };

  // Start conversion
  const handleStartCompression = async () => {
    if (files.length === 0 || isCompressing) return;
    setIsCompressing(true);
    setHasCompleted(false);
    setCreatedFolders([]);

    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('convert_local_audio_files', {
          files,
          targetBitrate,
          customOutputDir: customOutputDir || null,
          threadsCount: convertThreads,
        });
      } catch (err) {
        console.error('Erreur compression:', err);
        setIsCompressing(false);
      }
    } else {
      // Mock conversion
      const mockCreated = groupKeys.map(k => `C:\\Music\\${k} (${targetBitrate})`);
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'Converting' } : f))
        );
        await new Promise((r) => setTimeout(r, 400));

        const estimatedFinal = Math.round(files[i].original_size_bytes * 0.38);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'Completed', final_size_bytes: estimatedFinal } : f
          )
        );
      }
      setIsCompressing(false);
      setHasCompleted(true);
      setCreatedFolders(mockCreated);
    }
  };

  // Cancel conversion
  const handleCancel = async () => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('cancel_compression');
      } catch (err) {
        console.error('Erreur annulation:', err);
      }
    }
    setIsCompressing(false);
  };

  const handleClearAll = () => {
    if (isCompressing) return;
    setFiles([]);
    setHasCompleted(false);
    setCreatedFolders([]);
  };

  const removeFile = (path) => {
    setFiles((prev) => prev.filter((f) => f.path !== path));
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Hero Card */}
      <div className="glass-panel rounded-2xl p-6 border-purple-500/30 relative overflow-hidden shadow-psionic">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-pink-600/15 via-purple-600/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 p-0.5 shadow-psionic flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-psylocke-bg rounded-[10px] flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                Compresseur Audio & Isolation des Dossiers
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Zéro mélange
                </span>
              </h2>
              <p className="text-xs text-purple-300/80 mt-0.5">
                Chaque album ou dossier source est converti dans son propre sous-dossier dédié. Les pistes ne sont jamais mélangées !
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={handlePickFiles}
              disabled={isCompressing || isScanning}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-xs text-purple-200 hover:text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" /> : <FileAudio className="w-3.5 h-3.5 text-pink-400" />}
              <span>Choisir des Fichiers</span>
            </button>

            <button
              type="button"
              onClick={handlePickFolder}
              disabled={isCompressing || isScanning}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-xs text-purple-200 hover:text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Dossier Complet</span>
            </button>

            {files.length > 0 && !isCompressing && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 hover:text-red-200 transition-colors"
                title="Vider la liste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bitrate Selector */}
        <div className="pt-2 border-t border-purple-500/15">
          <label className="block text-xs font-semibold tracking-wider text-purple-300 uppercase mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-pink-400" />
            Sélectionnez le Bitrate Cible de Compression
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMPRESSION_PRESETS.map((preset) => {
              const isSelected = targetBitrate === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isCompressing}
                  onClick={() => setTargetBitrate(preset.id)}
                  className={`h-24 p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-w-0 ${
                    isSelected
                      ? 'bg-purple-900/60 border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/40'
                      : 'bg-psylocke-surface/70 border-purple-500/20 hover:border-purple-500/40 hover:bg-psylocke-surface/90'
                  } ${isCompressing ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between gap-1 w-full min-w-0">
                    <span className={`text-sm font-bold font-mono truncate ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                      {preset.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected ? 'bg-pink-500/30 text-pink-200 border border-pink-500/50' : 'bg-purple-950/50 text-purple-400'
                    }`}>
                      {preset.estSavings}
                    </span>
                  </div>
                  <div className="w-full min-w-0 mt-1">
                    <span className="text-[11px] font-medium text-fuchsia-300 truncate block">
                      {preset.badge}
                    </span>
                    <p className="text-[10px] text-purple-400/70 font-mono mt-0.5 truncate">
                      {preset.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Logic Explanation & Custom Output */}
        <div className="mt-4 pt-3 border-t border-purple-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-300/80 font-mono">
            <FolderTree className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Règle des dossiers :</span>
            <span className="text-purple-200 truncate max-w-md font-semibold">
              {customOutputDir 
                ? `Sous-dossiers isolés créés dans "${customOutputDir}"`
                : `Sous-dossier "_reduit_${targetBitrate}" créé dans chaque dossier album`}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePickOutputDir}
            disabled={isCompressing}
            className="text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/25 transition-all"
          >
            Changer le dossier racine de sortie
          </button>
        </div>
      </div>

      {/* Space Saving Stats Card */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel rounded-xl p-4 border-purple-500/20">
            <div className="text-[11px] font-mono text-purple-400/80 uppercase">Albums / Dossiers</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {groupKeys.length} <span className="text-purple-400 font-normal">({files.length} fichiers)</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border-purple-500/20">
            <div className="text-[11px] font-mono text-purple-400/80 uppercase">Taille Initiale</div>
            <div className="text-lg font-bold font-mono text-purple-200 mt-1">
              {formatBytes(totalOrigBytes)}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border-purple-500/20">
            <div className="text-[11px] font-mono text-purple-400/80 uppercase">Taille Après Compression</div>
            <div className="text-lg font-bold font-mono text-fuchsia-300 mt-1">
              {totalFinalBytes > 0 ? formatBytes(totalFinalBytes) : `~${formatBytes(totalOrigBytes * (targetBitrate === '192k' ? 0.6 : targetBitrate === '128k' ? 0.4 : 0.25))} (est.)`}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border-emerald-500/30 bg-emerald-950/15">
            <div className="text-[11px] font-mono text-emerald-400 uppercase">Espace Économisé</div>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-1 flex items-center gap-1.5">
              <span>{savedBytes > 0 ? formatBytes(savedBytes) : 'En calcul...'}</span>
              {savingsPercent > 0 && (
                <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                  -{savingsPercent}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Folders (when finished) */}
      {hasCompleted && createdFolders.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border-emerald-500/30 bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Dossiers isolés créés avec succès ({createdFolders.length} dossiers) :</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {createdFolders.map((folder, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-psylocke-darkest/70 border border-emerald-500/20">
                <span className="text-xs font-mono text-purple-200 truncate" title={folder}>
                  📁 {folder.split('\\').pop() || folder}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenFolder(folder)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Ouvrir</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Grouped by Source Folder (Album Cards) */}
      {groupKeys.length > 0 && (
        <div className="space-y-4">
          {groupKeys.map((groupName) => {
            const groupFileList = groupedFiles[groupName];
            const groupOrigBytes = groupFileList.reduce((acc, f) => acc + (f.original_size_bytes || 0), 0);
            const groupDone = groupFileList.filter(f => f.status === 'Completed').length;

            return (
              <div key={groupName} className="glass-panel rounded-2xl p-4 border-purple-500/25 shadow-sm space-y-3">
                {/* Folder Header */}
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/15">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-900/40 border border-purple-500/30">
                      <FolderCheck className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-sans">
                        {groupName}
                      </h3>
                      <p className="text-[11px] font-mono text-purple-400/70">
                        {groupFileList.length} fichiers • {formatBytes(groupOrigBytes)} au total ➜ Dossier cible dédié : « {groupName} ({targetBitrate}) »
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-fuchsia-300 font-semibold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/20">
                    {groupDone} / {groupFileList.length} réduits
                  </span>
                </div>

                {/* Tracks in this folder */}
                <div className="space-y-2">
                  {groupFileList.map((file) => {
                    const isConverting = file.status === 'Converting';
                    const isCompleted = file.status === 'Completed';
                    const isError = file.status === 'Error';
                    const singleSaved = file.final_size_bytes && file.original_size_bytes > file.final_size_bytes
                      ? file.original_size_bytes - file.final_size_bytes
                      : 0;
                    const singlePercent = file.final_size_bytes && file.original_size_bytes > 0
                      ? Math.round((singleSaved / file.original_size_bytes) * 100)
                      : 0;

                    return (
                      <div
                        key={file.path}
                        className={`flex items-center justify-between gap-3 p-2 rounded-xl border text-xs transition-all ${
                          isConverting
                            ? 'bg-purple-900/40 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                            : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/20'
                            : 'bg-psylocke-surface/40 border-purple-500/10'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-purple-100 truncate">
                            {file.filename}
                          </p>
                          <p className="text-[10px] font-mono text-purple-400/60 mt-0.5">
                            {formatBytes(file.original_size_bytes)}
                            {file.final_size_bytes && (
                              <span className="text-emerald-400 ml-2 font-semibold">
                                ➜ {formatBytes(file.final_size_bytes)} (-{singlePercent}%)
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isConverting && (
                            <div className="flex items-center gap-1 text-pink-300 font-mono animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                              <span>Réduction...</span>
                            </div>
                          )}

                          {isCompleted && (
                            <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>OK</span>
                            </span>
                          )}

                          {isError && (
                            <span className="text-red-400 font-mono" title={file.error_message || 'Erreur'}>
                              Erreur
                            </span>
                          )}

                          {!isCompressing && (
                            <button
                              type="button"
                              onClick={() => removeFile(file.path)}
                              className="p-1 hover:text-red-400 text-purple-400/50 transition-colors"
                              title="Retirer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      {files.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-psionic">
          <div className="text-xs font-mono text-purple-300">
            {completedCount} / {files.length} fichiers traités sur {groupKeys.length} albums
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isCompressing ? (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/50 text-red-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-red-400 text-red-400" />
                <span>Arrêter</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCompression}
                disabled={files.length === 0}
                className="px-8 py-3 rounded-xl btn-psychic-blade text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Lancer la Compression ({files.length} fichiers / {groupKeys.length} dossiers)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
