import React, { useState, useEffect } from 'react';
import './App.css';
import AudioProcessor from './components/AudioProcessor';
import ProfessionalBitrateGraph from './components/ProfessionalBitrateGraph';
import VideoReceiver from './components/VideoReceiver';
import NotificationSystem from './components/NotificationSystem';
import TabSystem, { TabType } from './components/TabSystem';
import ReceptoresZone from './components/ReceptoresZone';

// Declaração de tipos para Tauri
declare global {
  interface Window {
    __TAURI__: {
      invoke: (cmd: string, args?: any) => Promise<any>;
    };
  }
}

const App: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [audioLevels, setAudioLevels] = useState({ left: 0, right: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [currentBitrate, setCurrentBitrate] = useState(5000);
  const [targetBitrate, setTargetBitrate] = useState(5000);
  
  // Configurações de conexão
  const [protocol, setProtocol] = useState('srt');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('9999');
  const [resolution, setResolution] = useState('1920x1080p');
  const [frameRate, setFrameRate] = useState('60');
  const [latencyMode, setLatencyMode] = useState('ultra-low');
  const [bufferSize, setBufferSize] = useState(120);
  const [showReceiver, setShowReceiver] = useState(false);
  const [receiverUrl, setReceiverUrl] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  // Conectar ao backend Rust com notificações profissionais
  const handleStreamToggle = async () => {
    if (!ipAddress) {
      (window as any).showNotification({
        type: 'warning',
        title: 'Configuração Incompleta',
        message: 'Por favor, insira o endereço IP antes de iniciar o stream.'
      });
      return;
    }

    try {
      if (isStreaming) {
        const result = await window.__TAURI__.invoke('stop_streaming');
        console.log('Stream parado:', result);
        setIsStreaming(false);
        setShowReceiver(false);
        
        (window as any).showNotification({
          type: 'info',
          title: 'Stream Parado',
          message: 'Transmissão interrompida com sucesso.'
        });
      } else {
        const destination = `${protocol}://${ipAddress}:${port}`;
        setReceiverUrl(destination);
        
        const result = await window.__TAURI__.invoke('start_streaming', {
          destination: destination,
          bitrate: targetBitrate,
          resolution: resolution,
          frameRate: frameRate
        });
        
        console.log('Stream iniciado:', result);
        setIsStreaming(true);
        setShowReceiver(true);
        
        (window as any).showNotification({
          type: 'success',
          title: 'Stream Iniciado',
          message: `Transmitindo para ${destination}`,
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Erro ao toggle stream:', error);
      
      (window as any).showNotification({
        type: 'error',
        title: 'Erro de Transmissão',
        message: `Falha na conexão: ${error}`,
        duration: 8000
      });
    }
  };

  // Simular bitrate real durante streaming
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        const variation = (Math.random() - 0.5) * 500;
        const newBitrate = Math.max(1000, Math.min(10000, targetBitrate + variation));
        setCurrentBitrate(Math.round(newBitrate));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentBitrate(targetBitrate);
    }
  }, [isStreaming, targetBitrate]);

  return (
    <div className="app">
      {/* Header Professional */}
      <header className="header">
        <div className="logo">
          <h1>SRT Streaming Pro</h1>
          <span className="version">v1.0.0</span>
        </div>
        <div className="status">
          <span className={`status-dot ${isStreaming ? 'live' : 'offline'}`}></span>
          <span className="status-text">
            {isStreaming ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Panel - Inputs */}
        <div className="left-panel">
          <h3>FONTES DE INPUT</h3>
          <div className="source-list">
            <div className="source-item active">
              <div className="source-icon">📷</div>
              <div className="source-info">
                <div className="source-name">Webcam</div>
                <div className="source-res">1920x1080</div>
              </div>
            </div>
            <div className="source-item">
              <div className="source-icon">🖥️</div>
              <div className="source-info">
                <div className="source-name">Captura de Ecrã</div>
                <div className="source-res">1920x1080</div>
              </div>
            </div>
            <div className="source-item">
              <div className="source-icon">📁</div>
              <div className="source-info">
                <div className="source-name">Ficheiro de Média</div>
                <div className="source-res">Pronto</div>
              </div>
            </div>
            <div className="source-item">
              <div className="source-icon">📡</div>
              <div className="source-info">
                <div className="source-name">NDI Source</div>
                <div className="source-res">Descobrir</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel com Tab System */}
        <div className="center-panel">
          <TabSystem 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <div className="tab-content">
            {activeTab === 'preview' && (
              <div className="preview-container">
                <div className="preview-screen">
                  <div className="preview-placeholder">
                    <div className="preview-icon">📺</div>
                    <div className="preview-text">PRÉ-VISUALIZAÇÃO</div>
                    <div className="preview-res">{resolution} • {frameRate}fps</div>
                    {isStreaming && (
                      <div className="preview-status">
                        <span className="live-indicator">🔴 AO VIVO</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="transport-controls">
                  <button 
                    className={`stream-btn ${isStreaming ? 'stop' : 'start'}`}
                    onClick={handleStreamToggle}
                  >
                    {isStreaming ? '⏹ PARAR' : '▶ INICIAR'}
                  </button>
                  <div className="stream-info">
                    <div className="timer">
                      {isStreaming ? '00:15:42' : '00:00:00'}
                    </div>
                    <div className="destination">
                      {ipAddress ? `${protocol.toUpperCase()}://${ipAddress}:${port}` : 'Configurar destino'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'receptores' && (
  <ReceptoresZone />
)}
            
            {activeTab === 'rist' && (
              <div className="rist-container">
                <div className="dev-message">
                  <h1>🔗 RIST BONDING</h1>
                  <h2>Em Desenvolvimento</h2>
                  <p>Esta funcionalidade estará disponível em breve</p>
                </div>
              </div>
            )}
            
            {(activeTab === 'webcam' || activeTab === 'screen' || activeTab === 'media' || activeTab === 'ndi') && (
              <div className="temp-container">
                <h2>Zona em desenvolvimento</h2>
                <p>Tab: {activeTab}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="right-panel">
          <h3>CONFIGURAÇÕES</h3>
          
          {/* CONNECTION SETTINGS */}
          <div className="config-section">
            <h4>🌐 CONEXÃO</h4>
            <div className="control-group">
              <label>Protocolo</label>
              <select 
                className="select-input"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
              >
                <option value="srt">SRT</option>
                <option value="rtmp">RTMP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Endereço IP</label>
              <input 
                type="text" 
                placeholder="192.168.1.100"
                className="text-input"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
            
            <div className="control-group">
              <label>Porta</label>
              <input 
                type="number" 
                placeholder="9999"
                className="text-input"
                min="1"
                max="65535"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>

          {/* QUALITY SETTINGS */}
          <div className="config-section">
            <h4>⚙️ QUALIDADE</h4>
            <div className="control-group">
              <label>Resolução</label>
              <select 
                className="select-input"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option value="1920x1080p">1920x1080p (1080p Progressive)</option>
                <option value="1920x1080i">1920x1080i (1080i Interlaced)</option>
                <option value="1280x720p">1280x720p (720p Progressive)</option>
                <option value="854x480p">854x480p (480p Progressive)</option>
                <option value="720x576i">720x576i (PAL Interlaced)</option>
                <option value="720x480i">720x480i (NTSC Interlaced)</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Bitrate ({targetBitrate} kbps)</label>
              <input 
                type="range" 
                min="1000" 
                max="10000" 
                value={targetBitrate}
                onChange={(e) => setTargetBitrate(parseInt(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Frame Rate</label>
              <select 
                className="select-input"
                value={frameRate}
                onChange={(e) => setFrameRate(e.target.value)}
              >
                <option value="60">60 fps</option>
                <option value="30">30 fps</option>
                <option value="25">25 fps</option>
              </select>
            </div>
          </div>

          {/* LATENCY SETTINGS */}
          <div className="config-section">
            <h4>⚡ LATÊNCIA</h4>
            <div className="control-group">
              <label>Modo de Latência</label>
              <select 
                className="select-input"
                value={latencyMode}
                onChange={(e) => setLatencyMode(e.target.value)}
              >
                <option value="ultra-low">Ultra Baixa (20-50ms)</option>
                <option value="low">Baixa (50-100ms)</option>
                <option value="normal">Normal (100-200ms)</option>
                <option value="high-quality">Alta Qualidade (200ms+)</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Buffer ({bufferSize}ms)</label>
              <input 
                type="range" 
                min="20" 
                max="500" 
                value={bufferSize}
                onChange={(e) => setBufferSize(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* AUDIO CONTROL */}
          <div className="config-section">
            <h4>🎵 ÁUDIO</h4>
            <AudioProcessor 
              onAudioData={setAudioLevels}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(!isMuted)}
              isStreaming={isStreaming}
            />
            
            <div className="audio-meters">
              <div className="meter-channel">
                <span>L</span>
                <div className="meter-bar">
                  <div 
                    className="meter-fill"
                    style={{ width: `${audioLevels.left}%` }}
                  ></div>
                </div>
                <span className="meter-db">
                  {audioLevels.left > 0 ? `-${Math.round(60 - (audioLevels.left * 0.6))}dB` : '-∞dB'}
                </span>
              </div>
              <div className="meter-channel">
                <span>R</span>
                <div className="meter-bar">
                  <div 
                    className="meter-fill"
                    style={{ width: `${audioLevels.right}%` }}
                  ></div>
                </div>
                <span className="meter-db">
                  {audioLevels.right > 0 ? `-${Math.round(60 - (audioLevels.right * 0.6))}dB` : '-∞dB'}
                </span>
              </div>
            </div>
          </div>

          {/* ANALYTICS */}
          <div className="config-section">
            <h4>📊 ANÁLISE</h4>
            <ProfessionalBitrateGraph 
              currentBitrate={currentBitrate}
              targetBitrate={targetBitrate}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="label">Latência:</span>
          <span className="value">45ms</span>
        </div>
        <div className="status-item">
          <span className="label">Frames perdidos:</span>
          <span className="value">0</span>
        </div>
        <div className="status-item">
          <span className="label">Rede:</span>
          <span className="value">Excelente</span>
        </div>
        <div className="status-item">
          <span className="label">CPU:</span>
          <span className="value">12%</span>
        </div>
      </div>

      {/* Sistema de Notificações */}
      <NotificationSystem />
    </div>
  );
};

export default App;