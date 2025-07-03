import React, { useEffect, useRef, useState } from 'react';

interface BitrateGraphProps {
  currentBitrate: number;
  targetBitrate: number;
  isStreaming: boolean;
}

interface BitrateData {
  timestamp: number;
  bitrate: number;
  target: number;
}

const BitrateGraph: React.FC<BitrateGraphProps> = ({ 
  currentBitrate, 
  targetBitrate, 
  isStreaming 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bitrateHistory, setBitrateHistory] = useState<BitrateData[]>([]);
  const [stats, setStats] = useState({
    avgBitrate: 0,
    minBitrate: 0,
    maxBitrate: 0,
    variance: 0
  });

  // Atualizar dados
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newData: BitrateData = {
        timestamp: now,
        bitrate: currentBitrate,
        target: targetBitrate
      };

      setBitrateHistory(prev => {
        const updated = [...prev, newData];
        // Manter apenas últimos 60 segundos
        const cutoff = now - 60000;
        return updated.filter(d => d.timestamp > cutoff);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, currentBitrate, targetBitrate]);

  // Calcular estatísticas
  useEffect(() => {
    if (bitrateHistory.length === 0) return;

    const bitrates = bitrateHistory.map(d => d.bitrate);
    const avg = bitrates.reduce((a, b) => a + b, 0) / bitrates.length;
    const min = Math.min(...bitrates);
    const max = Math.max(...bitrates);
    const variance = bitrates.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / bitrates.length;

    setStats({
      avgBitrate: Math.round(avg),
      minBitrate: Math.round(min),
      maxBitrate: Math.round(max),
      variance: Math.round(Math.sqrt(variance))
    });
  }, [bitrateHistory]);

  // Desenhar gráfico
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bitrateHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Limpar canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dados
    const maxBitrate = Math.max(targetBitrate * 1.5, Math.max(...bitrateHistory.map(d => d.bitrate)));
    const xStep = width / (bitrateHistory.length - 1);

    // Linha alvo
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const targetY = height - (targetBitrate / maxBitrate) * height;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();

    // Linha bitrate real
    ctx.strokeStyle = '#2d7a5f';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    bitrateHistory.forEach((data, index) => {
      const x = index * xStep;
      const y = height - (data.bitrate / maxBitrate) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Área sob a curva
    ctx.fillStyle = 'rgba(45, 122, 95, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    bitrateHistory.forEach((data, index) => {
      const x = index * xStep;
      const y = height - (data.bitrate / maxBitrate) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

  }, [bitrateHistory, targetBitrate]);

  return (
    <div className="bitrate-graph">
      <div className="graph-header">
        <h4>BITRATE ANALYSIS</h4>
        <div className="graph-legend">
          <span className="legend-item">
            <span className="legend-color target"></span>
            Target: {targetBitrate} kbps
          </span>
          <span className="legend-item">
            <span className="legend-color actual"></span>
            Actual: {currentBitrate} kbps
          </span>
        </div>
      </div>

      <div className="graph-container">
        <canvas ref={canvasRef} className="bitrate-canvas" />
        {!isStreaming && (
          <div className="graph-overlay">
            <div className="overlay-text">START STREAMING TO VIEW GRAPH</div>
          </div>
        )}
      </div>

      <div className="graph-stats">
        <div className="stat-item">
          <span className="stat-label">AVG:</span>
          <span className="stat-value">{stats.avgBitrate} kbps</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">MIN:</span>
          <span className="stat-value">{stats.minBitrate} kbps</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">MAX:</span>
          <span className="stat-value">{stats.maxBitrate} kbps</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">JITTER:</span>
          <span className="stat-value">{stats.variance} kbps</span>
        </div>
      </div>
    </div>
  );
};

export default BitrateGraph;