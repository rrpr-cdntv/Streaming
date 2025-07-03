import React, { useState } from 'react';

interface Receptor {
  id: number;
  name: string;
  url: string;
  status: 'live' | 'connecting' | 'offline';
  resolution?: string;
  bitrate?: number;
  audioLevels?: {
    left: number;
    right: number;
  };
}

const ReceptoresZone: React.FC = () => {
  const [receptores, setReceptores] = useState<Receptor[]>([
    {
      id: 1,
      name: 'Camera 1',
      url: 'srt://192.168.1.100:9999',
      status: 'live',
      resolution: '1920x1080',
      bitrate: 5000,
      audioLevels: { left: -12, right: -15 }
    },
    {
      id: 2,
      name: 'Camera 2',
      url: 'srt://192.168.1.101:9999',
      status: 'connecting'
    },
    {
      id: 3,
      name: 'Camera 3',
      url: 'srt://192.168.1.102:9999',
      status: 'offline'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'connecting': return '🟡';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'connecting': return 'CONNECTING';
      case 'offline': return 'OFFLINE';
      default: return 'OFFLINE';
    }
  };

  const renderMonitorContent = (receptor: Receptor) => {
    if (receptor.status === 'live') {
      return (
        <div className="monitor-content">
          <div className="video-placeholder">
            <div className="video-signal">📹</div>
            <div className="video-info">
              <div className="video-res">{receptor.resolution}</div>
              <div className="video-bitrate">{receptor.bitrate} kbps</div>
            </div>
          </div>
        </div>
      );
    } else if (receptor.status === 'connecting') {
      return (
        <div className="monitor-content">
          <div className="connecting-animation">
            <div className="spinner"></div>
            <div className="connecting-text">Connecting...</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="monitor-content">
          <div className="no-signal">
            <div className="no-signal-icon">📵</div>
            <div className="no-signal-text">No Signal</div>
          </div>
        </div>
      );
    }
  };

  const renderAudioMeters = (receptor: Receptor) => {
    if (!receptor.audioLevels) return null;

    const calculateMeterWidth = (db: number) => {
      // Convert dB to percentage (assuming -60dB to 0dB range)
      const minDb = -60;
      const maxDb = 0;
      const percentage = Math.max(0, Math.min(100, ((db - minDb) / (maxDb - minDb)) * 100));
      return percentage;
    };

    return (
      <div className="receptor-audio">
        <div className="audio-meter">
          <div className="channel-label">L</div>
          <div className="meter-bar">
            <div 
              className="meter-fill" 
              style={{ width: `${calculateMeterWidth(receptor.audioLevels.left)}%` }}
            />
          </div>
          <div className="meter-db">{receptor.audioLevels.left}dB</div>
        </div>
        <div className="audio-meter">
          <div className="channel-label">R</div>
          <div className="meter-bar">
            <div 
              className="meter-fill" 
              style={{ width: `${calculateMeterWidth(receptor.audioLevels.right)}%` }}
            />
          </div>
          <div className="meter-db">{receptor.audioLevels.right}dB</div>
        </div>
      </div>
    );
  };

  const addReceptor = () => {
    const newReceptor: Receptor = {
      id: receptores.length + 1,
      name: `Receptor ${receptores.length + 1}`,
      url: `srt://192.168.1.${100 + receptores.length + 1}:9999`,
      status: 'offline'
    };
    setReceptores([...receptores, newReceptor]);
  };

  const liveCount = receptores.filter(r => r.status === 'live').length;
  const connectingCount = receptores.filter(r => r.status === 'connecting').length;
  const offlineCount = receptores.filter(r => r.status === 'offline').length;

  return (
    <div className="receptores-zone">
      <div className="receptores-header">
        <h2>Receptores</h2>
        <div className="receptores-stats">
          <div className="stat">
            <div className="stat-label">LIVE</div>
            <div className="stat-value">{liveCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label">CONNECTING</div>
            <div className="stat-value">{connectingCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label">OFFLINE</div>
            <div className="stat-value">{offlineCount}</div>
          </div>
        </div>
      </div>

      <div className="receptores-grid">
        {receptores.map(receptor => (
          <div key={receptor.id} className={`receptor-card ${receptor.status}`}>
            <div className="receptor-monitor">
              {renderMonitorContent(receptor)}
              <div className="monitor-status">
                <span className="status-indicator">
                  {getStatusIcon(receptor.status)}
                </span>
                <span>{getStatusText(receptor.status)}</span>
              </div>
            </div>

            <div className="receptor-info">
              <div className="receptor-name">{receptor.name}</div>
              <div className="receptor-url">{receptor.url}</div>
            </div>

            {renderAudioMeters(receptor)}

            <div className="receptor-controls">
              <button className="control-btn">▶️</button>
              <button className="control-btn">⏹️</button>
              <button className="control-btn">⚙️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-receptor">
        <button className="add-receptor-btn" onClick={addReceptor}>
          <span className="add-icon">➕</span>
          <span className="add-text">ADICIONAR RECEPTOR</span>
        </button>
      </div>
    </div>
  );
};

export default ReceptoresZone;