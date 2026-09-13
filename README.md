# ⚡ fkYT offline me

> **Client lourd Windows autonome & ultra-performant** pour le téléchargement de playlists YouTube / YouTube Music en MP3 320 kbps haute fidélité et la compression audio locale par album.

![fkYT offline me](https://img.shields.io/badge/Release-v2.3-f43f5e?style=for-the-badge&logo=windows)
![Tauri v2](https://img.shields.io/badge/Tauri-v2-a855f7?style=for-the-badge&logo=tauri)
![Rust](https://img.shields.io/badge/Rust-Backend-f59e0b?style=for-the-badge&logo=rust)
![React](https://img.shields.io/badge/React-18-38bdf8?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=for-the-badge&logo=tailwindcss)

---

## ✨ Fonctionnalités Clés

### 🎵 1. Téléchargeur de Playlists & File d'Attente
- **Multi-Playlists (File d'attente / Queue) :** Collez un ou plusieurs liens de playlists en une seule fois. L'application résout chaque playlist et les enchaîne automatiquement.
- **Choix du Débit Audio :**
  - `320 kbps` (Master CBR — Plein débit haute fidélité)
  - `256 kbps` (Très Haute Qualité)
  - `192 kbps` (Équilibré — Idéal Smartphone)
  - `128 kbps` (Compact — Économie d'espace)
  - `VBR V0` (Variable dynamique ~245 kbps)
- **Métadonnées & Tags ID3 Automatiques :** Intégration du titre, de l'artiste et de la pochette d'album miniature directement dans chaque fichier MP3.
- **Structure de dossiers propre :** Chaque playlist est automatiquement sauvegardée dans son propre sous-dossier nommé d'après la playlist.

### 🗜️ 2. Compresseur Audio & Gain d'Espace (Zéro Mélange)
- Réduisez la taille de votre bibliothèque musicale locale (WAV, FLAC, MP3 volumineux).
- **Isolation garantie des dossiers :** Chaque album ou dossier source est converti dans son propre sous-dossier dédié (ex: `MonAlbum (_reduit_128k)`). Les pistes ne sont jamais mélangées !
- Calcul automatique du gain d'espace en temps réel (`-40%`, `-60%`, `-80%`).

### ⚙️ 3. Détection Matérielle & Contrôle Multi-Threads
- **Autodétection du processeur :** Détection automatique du modèle CPU, du nombre de cœurs logiques et de la RAM disponible.
- **Sliders de Threads Indépendants :**
  - Threads de téléchargement YouTube (optimisé pour éviter le throttling).
  - Threads d'encodage local ffmpeg (parallélisation maximale selon vos cœurs).
- **Profils en 1 clic :** Recommandé / Éco / Turbo.

### 🪟 4. Expérience Desktop 100% Native
- Fenêtre sans bordures disgracieuses (*frameless*) avec barre de titre intégrée.
- Boutons natifs Windows : Minimiser, Agrandir / Niveau inférieur, Fermer.
- Thème **Psylocke** : esthétique cyberpunk violet néon et fuchsia haute fidélité.
- Aucune fenêtre console CMD parasite à l'ouverture.

---

## 🛠️ Architecture Technique

```
┌──────────────────────────────────────────────┐
│       Frontend: React 18 + Tailwind CSS      │
│     (Vite, Lucide Icons, Glassmorphism UI)   │
└──────────────────────┬───────────────────────┘
                       │ IPC (Tauri v2 Events)
┌──────────────────────▼───────────────────────┐
│              Backend: Rust                   │
│   (tokio async, std::process, hardware sys)  │
└──────────────┬────────────────┬──────────────┘
               │                │
     ┌─────────▼────────┐  ┌────▼─────────────┐
     │    yt-dlp.exe    │  │    ffmpeg.exe    │
     │ (Scraping/Stream)│  │ (ID3 / MP3 320k) │
     └──────────────────┘  └──────────────────┘
```

---

## 📦 Installation & Téléchargement

Rendez-vous dans la section [Releases](../../releases) pour télécharger :
1. **`fkyt-offline-me-setup.exe`** : Installateur Windows officiel avec raccourci bureau et menu Démarrer.
2. **`fkyt-offline-me-portable.zip`** : Version autonome portable ne nécessitant aucune installation.

---

## 💻 Développement Local

### Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://www.rust-lang.org/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) & [ffmpeg](https://ffmpeg.org/) dans `src-tauri/bin/`

### Commandes
```bash
# 1. Installation des dépendances frontend
npm install

# 2. Lancement en mode développement (hot-reload)
npx tauri dev

# 3. Compilation de l'exécutable de release
npx tauri build
```

---

## 📜 Licence
Projet open-source sous licence [MIT](LICENSE).
