import React, { useRef, useEffect, useState } from 'react';

interface VideoReceiverProps {
  streamUrl: string;
  isActive: boolean;
  protocol: string;
}

const VideoReceiver: React.FC<VideoReceiverProps> = ({ 
  streamUrl, 
  isActive, 
  protocol 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [stats, setStats] = useState({
    resolution: '0x0',
    fps: 0,
    bitrate: 0,
    latency: 0
  });

  useEffect(() => {
    if (isActive && streamUrl && videoRef.current) {
      setConnectionStatus('connecting');
      
      // Para diferentes protocolos
      if (protocol === 'srt') {
        // SRT precisa de conversão para HLS ou WebRTC
        // Por agora simulamos conexão
        setTimeout(() => {
          setConnectionStatus('connected');
          setStats({
            resolution: '1920x1080',
            fps: 30,
            bitrate: 5000,
            latency: 45
          });
        }, 2000);
      } else if (protocol === 'rtmp') {
        // RTMP pode ser convertido para HLS
        videoRef.current.src = streamUrl.replace('rtmp:', 'http:') + '/playlist.m3u8';
        videoRef.current.play()
          .then(() => setConnectionStatus('connected'))
          .catch(() => setConnectionStatus('error'));
      }
    } else {
      setConnectionStatus('disconnected');
      setStats({
        resolution: '0x0',
        fps: 0,
        bitrate: 0,
        latency: 0
      });
    }
  }, [isActive, streamUrl, protocol]);

  return (
    <div className="video-receiver">
      <div className="receiver-header">
        <h4>📺 RECEPTOR DE VÍDEO</h4>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' && <span className="status-connected">🟢 Conectado</span>}
          {connectionStatus === 'connecting' && <span className="status-connecting">🟡 Conectando...</span>}
          {connectionStatus === 'disconnected' && <span className="status-disconnected">⚪ Desconectado</span>}
          {connectionStatus === 'error' && <span className="status-error">🔴 Erro de Conexão</span>}
        </div>
      </div>

      <div className="receiver-content">
        {isActive ? (
          <div className="video-container">
            <video 
              ref={videoRef}
              className="receiver-video"
              controls
              muted
              autoPlay
              playsInline
            />
            
            {connectionStatus === 'connecting' && (
              <div className="video-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Conectando ao stream...</div>
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="video-overlay error">
                <div className="error-icon">⚠️</div>
                <div className="error-text">Falha na conexão</div>
                <div className="error-details">Verifique o endereço do stream</div>
              </div>
            )}
          </div>
        ) : (
          <div className="receiver-placeholder">
            <div className="placeholder-icon">📺</div>
            <div className="placeholder-text">RECEPTOR INATIVO</div>
            <div className="placeholder-subtitle">Inicie um stream para visualizar</div>
          </div>
        )}
      </div>

      {/* Stats do receptor */}
      {connectionStatus === 'connected' && (
        <div className="receiver-stats">
          <div className="receiver-stat">
            <span className="stat-label">Resolução:</span>
            <span className="stat-value">{stats.resolution}</span>
          </div>
          <div className="receiver-stat">
            <span className="stat-label">FPS:</span>
            <span className="stat-value">{stats.fps}</span>
          </div>
          <div className="receiver-stat">
            <span className="stat-label">Bitrate:</span>
            <span className="stat-value">{stats.bitrate} kbps</span>
          </div>
          <div className="receiver-stat">
            <span className="stat-label">Latência:</span>
            <span className="stat-value">{stats.latency}ms</span>
          </div>
        </div>
      )}

      {/* Controles do receptor */}
      <div className="receiver-controls">
        <div className="receiver-info">
          <span className="stream-url">
            {streamUrl || 'Nenhum stream configurado'}
          </span>
        </div>
        
        {isActive && (
          <div className="receiver-actions">
            <button className="receiver-btn fullscreen">
              🔳 Ecrã Completo
            </button>
            <button className="receiver-btn record">
              🔴 Gravar
            </button>
            <button className="receiver-btn screenshot">
              📸 Captura
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoReceiver;