use std::process::Command;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamConfig {
    pub destination: String,
    pub bitrate: u32,
    pub resolution: String,
    pub audio_enabled: bool,
    pub video_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStats {
    pub bitrate: u32,
    pub fps: f32,
    pub dropped_frames: u32,
    pub network_quality: String,
    pub uptime: u64,
}

pub struct StreamingEngine {
    pub is_streaming: Arc<Mutex<bool>>,
    pub current_stats: Arc<Mutex<StreamStats>>,
    pub config: Arc<Mutex<StreamConfig>>,
}

impl StreamingEngine {
    pub fn new() -> Self {
        Self {
            is_streaming: Arc::new(Mutex::new(false)),
            current_stats: Arc::new(Mutex::new(StreamStats {
                bitrate: 0,
                fps: 0.0,
                dropped_frames: 0,
                network_quality: "Unknown".to_string(),
                uptime: 0,
            })),
            config: Arc::new(Mutex::new(StreamConfig {
                destination: "".to_string(),
                bitrate: 5000,
                resolution: "1920x1080".to_string(),
                audio_enabled: true,
                video_enabled: true,
            })),
        }
    }

    pub async fn start_stream(&self, config: StreamConfig) -> Result<(), String> {
        let mut is_streaming = self.is_streaming.lock().await;
        if *is_streaming {
            return Err("Stream já está ativo".to_string());
        }

        // Comando FFmpeg para streaming SRT real
        let mut cmd = Command::new("ffmpeg");
        cmd.arg("-f").arg("dshow") // DirectShow no Windows
           .arg("-i").arg("video=dummy:audio=dummy") // Placeholder
           .arg("-c:v").arg("libx264")
           .arg("-preset").arg("ultrafast")
           .arg("-tune").arg("zerolatency")
           .arg("-b:v").arg(format!("{}k", config.bitrate))
           .arg("-c:a").arg("aac")
           .arg("-b:a").arg("128k")
           .arg("-f").arg("mpegts")
           .arg(&config.destination);

        match cmd.spawn() {
            Ok(_) => {
                *is_streaming = true;
                *self.config.lock().await = config;
                Ok(())
            }
            Err(e) => Err(format!("Erro ao iniciar stream: {}", e))
        }
    }

    pub async fn stop_stream(&self) -> Result<(), String> {
        let mut is_streaming = self.is_streaming.lock().await;
        if !*is_streaming {
            return Err("Stream não está ativo".to_string());
        }

        // Parar processo FFmpeg
        Command::new("taskkill")
            .arg("/f")
            .arg("/im")
            .arg("ffmpeg.exe")
            .spawn()
            .map_err(|e| format!("Erro ao parar stream: {}", e))?;

        *is_streaming = false;
        Ok(())
    }

    pub async fn get_stats(&self) -> StreamStats {
        self.current_stats.lock().await.clone()
    }
}