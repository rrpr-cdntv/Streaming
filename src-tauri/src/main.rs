// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod streaming;

use streaming::{StreamingEngine, StreamConfig};
use std::sync::Arc;
use tauri::State;

pub struct AppState {
    pub streaming_engine: Arc<StreamingEngine>,
}

#[tauri::command]
async fn start_streaming(
    destination: String,
    bitrate: u32,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let config = StreamConfig {
        destination,
        bitrate,
        resolution: "1920x1080".to_string(),
        audio_enabled: true,
        video_enabled: true,
    };

    state.streaming_engine.start_stream(config).await?;
    Ok("Stream iniciado com sucesso".to_string())
}

#[tauri::command]
async fn stop_streaming(state: State<'_, AppState>) -> Result<String, String> {
    state.streaming_engine.stop_stream().await?;
    Ok("Stream parado com sucesso".to_string())
}

fn main() {
    let streaming_engine = Arc::new(StreamingEngine::new());
    let app_state = AppState { streaming_engine };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![start_streaming, stop_streaming])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}