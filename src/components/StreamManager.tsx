import React, { useState, useEffect } from 'react';
import VideoPreview from './VideoPreview';

interface StreamConfig {
  id: string;
  name: string;
  destination: string;
  bitrate: number;
  resolution: string;
  isActive: boolean;
  source: 'webcam' | 'screen' | 'file' | 'ip-camera';
}

const StreamManager: React.FC = () => {
  const [streams, setStreams] = useState<StreamConfig[]>([
    {
      id: 'stream-1',
      name: 'Main Stream',
      destination: 'srt://localhost:9999',
      bitrate: 5000,
      resolution: '1920x1080',
      isActive: false,
      source: 'webcam'
    },
    {
      id: 'stream-2', 
      name: 'Backup Stream',
      destination: 'rtmp://localhost:1935/live/backup',
      bitrate: 3000,
      resolution: '1280x720',
      isActive: false,
      source: 'webcam'
    }
  ]);

  const [selectedStream, setSelectedStream] = useState<string>('stream-1');

  // Adicionar nova stream
  const addStream = () => {
    if (streams.length >= 8) {
      alert('Máximo de 8 streams simultâneas');
      return;
    }

    const newStream: StreamConfig = {
      id: `stream-${Date.now()}`,
      name: `Stream ${streams.length + 1}`,
      destination: '',
      bitrate: 2500,
      resolution: '1280x720',
      isActive: false,
      source: 'webcam'
    };

    setStreams([...streams, newStream]);
  };

  // Remover stream
  const removeStream = (streamId: string) => {
    setStreams(streams.filter(s => s.id !== streamId));
  };

  // Toggle stream ativo
  const toggleStream = (streamId: string) => {
    setStreams(streams.map(stream => 
      stream.id === streamId 
        ? { ...stream, isActive: !stream.isActive }
        : stream
    ));
  };

  // Atualizar configuração da stream
  const updateStream = (streamId: string, updates: Partial<StreamConfig>) => {
    setStreams(streams.map(stream =>
      stream.id === streamId
        ? { ...stream, ...updates }
        : stream
    ));
  };

  return (
    <div className="stream-manager">
      {/* Stream List */}
      <div className="stream-list">
        <div className="stream-header">
          <h3>STREAMS ({streams.length}/8)</h3>
          <button 
            onClick={addStream}
            className="add-stream-btn"
            disabled={streams.length >= 8}
          >
            + ADD STREAM
          </button>
        </div>

        {streams.map(stream => (
          <div 
            key={stream.id}
            className={`stream-item ${selectedStream === stream.id ? 'selected' : ''}`}
            onClick={() => setSelectedStream(stream.id)}
          >
            <div className="stream-info">
              <div className="stream-name">{stream.name}</div>
              <div className="stream-status">
                <span className={`status-dot ${stream.isActive ? 'active' : 'inactive'}`}></span>
                <span className="status-text">
                  {stream.isActive ? 'STREAMING' : 'READY'}
                </span>
              </div>
            </div>
            
            <div className="stream-controls">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStream(stream.id);
                }}
                className={`stream-toggle ${stream.isActive ? 'stop' : 'start'}`}
              >
                {stream.isActive ? '⏹' : '▶'}
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeStream(stream.id);
                }}
                className="stream-remove"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stream Configuration */}
      {selectedStream && (
        <div className="stream-config">
          {(() => {
            const stream = streams.find(s => s.id === selectedStream);
            if (!stream) return null;

            return (
              <div className="config-panel">
                <h4>CONFIGURAÇÃO - {stream.name}</h4>
                
                <div className="config-group">
                  <label>Nome da Stream</label>
                  <input
                    type="text"
                    value={stream.name}
                    onChange={(e) => updateStream(stream.id, { name: e.target.value })}
                    className="config-input"
                  />
                </div>

                <div className="config-group">
                  <label>Destino</label>
                  <input
                    type="text"
                    value={stream.destination}
                    onChange={(e) => updateStream(stream.id, { destination: e.target.value })}
                    placeholder="srt://server:port ou rtmp://server/key"
                    className="config-input"
                  />
                </div>

                <div className="config-group">
                  <label>Bitrate (kbps)</label>
                  <input
                    type="number"
                    value={stream.bitrate}
                    onChange={(e) => updateStream(stream.id, { bitrate: parseInt(e.target.value) })}
                    min="500"
                    max="10000"
                    className="config-input"
                  />
                </div>

                <div className="config-group">
                  <label>Resolução</label>
                  <select
                    value={stream.resolution}
                    onChange={(e) => updateStream(stream.id, { resolution: e.target.value })}
                    className="config-select"
                  >
                    <option value="1920x1080">1920x1080 (1080p)</option>
                    <option value="1280x720">1280x720 (720p)</option>
                    <option value="854x480">854x480 (480p)</option>
                    <option value="640x360">640x360 (360p)</option>
                  </select>
                </div>

                <div className="config-group">
                  <label>Fonte</label>
                  <select
                    value={stream.source}
                    onChange={(e) => updateStream(stream.id, { source: e.target.value as any })}
                    className="config-select"
                  >
                    <option value="webcam">Webcam</option>
                    <option value="screen">Screen Capture</option>
                    <option value="file">Media File</option>
                    <option value="ip-camera">IP Camera</option>
                  </select>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default StreamManager;