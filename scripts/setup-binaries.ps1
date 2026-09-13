# Script d'installation automatique des binaires pour fkYT offline me
# Télécharge et configure yt-dlp et ffmpeg dans src-tauri/bin/ avec la nomenclature sidecar Tauri

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."
$BinDir = Join-Path $ProjectRoot "src-tauri\bin"

if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "   fkYT offline me - Configuration des Binaires Sidecar   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "Dossier cible : $BinDir`n" -ForegroundColor Gray

# 1. yt-dlp
$YtDlpUrl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
$YtDlpSidecar = Join-Path $BinDir "yt-dlp-x86_64-pc-windows-msvc.exe"
$YtDlpLocal = Join-Path $BinDir "yt-dlp.exe"

Write-Host "[1/2] Téléchargement du binaire officiel yt-dlp.exe..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $YtDlpUrl -OutFile $YtDlpSidecar -UseBasicParsing
    Copy-Item -Path $YtDlpSidecar -Destination $YtDlpLocal -Force
    Write-Host "  -> yt-dlp configuré avec succès !" -ForegroundColor Green
} catch {
    Write-Host "  -> Erreur lors du téléchargement de yt-dlp : $_" -ForegroundColor Red
}

# 2. ffmpeg
$FfmpegSidecar = Join-Path $BinDir "ffmpeg-x86_64-pc-windows-msvc.exe"
$FfmpegLocal = Join-Path $BinDir "ffmpeg.exe"

Write-Host "`n[2/2] Configuration de ffmpeg..." -ForegroundColor Yellow

# Vérifier si ffmpeg est déjà sur le système (en contournant les shims chocolatey si nécessaire)
$SystemFfmpeg = $null
$ChocoRealFfmpeg = "C:\ProgramData\chocolatey\lib\ffmpeg\tools\ffmpeg\bin\ffmpeg.exe"
if (Test-Path $ChocoRealFfmpeg) {
    $SystemFfmpeg = $ChocoRealFfmpeg
} else {
    $Found = (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue).Source
    if ($Found -and (Test-Path $Found)) {
        $SystemFfmpeg = $Found
    }
}
if ($SystemFfmpeg -and (Test-Path $SystemFfmpeg)) {
    Write-Host "  -> ffmpeg détecté sur le système : $SystemFfmpeg" -ForegroundColor Cyan
    Copy-Item -Path $SystemFfmpeg -Destination $FfmpegSidecar -Force
    Copy-Item -Path $SystemFfmpeg -Destination $FfmpegLocal -Force
    Write-Host "  -> ffmpeg copié dans le dossier sidecar avec succès !" -ForegroundColor Green
} else {
    Write-Host "  -> ffmpeg non trouvé dans le PATH. Téléchargement d'une archive minimale..." -ForegroundColor Yellow
    $FfmpegZipUrl = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    $TempZip = Join-Path $env:TEMP "ffmpeg-temp.zip"
    $TempExtract = Join-Path $env:TEMP "ffmpeg-temp"
    
    Invoke-WebRequest -Uri $FfmpegZipUrl -OutFile $TempZip -UseBasicParsing
    Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force
    
    $ExtractedFfmpeg = Get-ChildItem -Path $TempExtract -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
    if ($ExtractedFfmpeg) {
        Copy-Item -Path $ExtractedFfmpeg.FullName -Destination $FfmpegSidecar -Force
        Copy-Item -Path $ExtractedFfmpeg.FullName -Destination $FfmpegLocal -Force
        Write-Host "  -> ffmpeg extrait et configuré avec succès !" -ForegroundColor Green
    }
    
    # Nettoyage
    Remove-Item -Path $TempZip -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $TempExtract -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n==========================================================" -ForegroundColor Magenta
Write-Host "   Configuration terminée ! Tous les binaires sont prêts. " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Magenta
