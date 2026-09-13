use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemSpecs {
    pub cpu_model: String,
    pub logical_cores: usize,
    pub total_ram_gb: f64,
    pub recommended_download_threads: usize,
    pub recommended_convert_threads: usize,
}

#[repr(C)]
struct MEMORYSTATUSEX {
    dw_length: u32,
    dw_memory_load: u32,
    ull_total_phys: u64,
    ull_avail_phys: u64,
    ull_total_page_file: u64,
    ull_avail_page_file: u64,
    ull_total_virtual: u64,
    ull_avail_virtual: u64,
    ull_avail_extended_virtual: u64,
}

#[cfg(target_os = "windows")]
extern "system" {
    fn GlobalMemoryStatusEx(lp_buffer: *mut MEMORYSTATUSEX) -> i32;
}

/// Récupère la mémoire vive totale sous Windows
fn get_total_ram_windows() -> f64 {
    #[cfg(target_os = "windows")]
    unsafe {
        let mut status = MEMORYSTATUSEX {
            dw_length: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            dw_memory_load: 0,
            ull_total_phys: 0,
            ull_avail_phys: 0,
            ull_total_page_file: 0,
            ull_avail_page_file: 0,
            ull_total_virtual: 0,
            ull_avail_virtual: 0,
            ull_avail_extended_virtual: 0,
        };

        if GlobalMemoryStatusEx(&mut status) != 0 {
            let gb = status.ull_total_phys as f64 / (1024.0 * 1024.0 * 1024.0);
            return (gb * 10.0).round() / 10.0;
        }
    }
    16.0
}

/// Récupère le nom du processeur dans le registre Windows
fn get_cpu_name_windows() -> String {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let output = Command::new("powershell")
            .creation_flags(CREATE_NO_WINDOW)
            .args(&[
                "-NoProfile",
                "-Command",
                "(Get-ItemProperty -Path 'HKLM:\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0').ProcessorNameString",
            ])
            .output();

        if let Ok(out) = output {
            let name = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !name.is_empty() {
                return name;
            }
        }
    }
    "Processeur Multi-Cœur".to_string()
}

#[tauri::command]
pub fn get_system_specs() -> Result<SystemSpecs, String> {
    let cores = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);

    let ram_gb = get_total_ram_windows();
    let cpu_name = get_cpu_name_windows();

    // Recommandation pour les téléchargements YouTube :
    // Maximum 3 à 4 threads pour éviter les rate-limits IP de YouTube
    let rec_download = if cores <= 4 || ram_gb < 8.0 {
        2
    } else if cores <= 8 || ram_gb < 16.0 {
        3
    } else {
        3 // 3 est le sweet-spot parfait pour YouTube, 4 max
    };

    // Recommandation pour la conversion locale ffmpeg (pure charge CPU) :
    // On peut allouer presque tous les cœurs sans risque réseau
    let rec_convert = if cores <= 4 {
        cores.max(2)
    } else if cores <= 8 {
        (cores - 2).max(4)
    } else {
        (cores - 2).clamp(4, 12)
    };

    Ok(SystemSpecs {
        cpu_model: cpu_name,
        logical_cores: cores,
        total_ram_gb: ram_gb,
        recommended_download_threads: rec_download,
        recommended_convert_threads: rec_convert,
    })
}
