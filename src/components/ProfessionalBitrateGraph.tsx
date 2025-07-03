import React, { useEffect, useRef, useState } from 'react';

interface ProfessionalBitrateGraphProps {
  currentBitrate: number;
  targetBitrate: number;
  isStreaming: boolean;
}

const ProfessionalBitrateGraph: React.FC<ProfessionalBitrateGraphProps> = ({
  currentBitrate,
  targetBitrate,
  isStreaming
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bitrateHistory, setBitrateHistory] = useState<number[]>([]);

  // Atualizar dados em tempo real
  useEffect(() => {
    if (!isStreaming) {
      setBitrateHistory([]);
      return;
    }

    const interval = setInterval(() => {
      setBitrateHistory(prev => {
        const newHistory = [...prev, currentBitrate];
        return newHistory.slice(-120); // 2 minutos de dados
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, currentBitrate]);

  // Desenhar gráfico profissional estilo imagem
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background escuro
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (bitrateHistory.length === 0) {
      // Placeholder quando não há dados
      ctx.fillStyle = '#333';
      ctx.font = '12px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('Aguardando dados de streaming...', width / 2, height / 2);
      return;
    }

    // Grid subtil
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calcular escala
    const maxBitrate = Math.max(targetBitrate * 1.3, Math.max(...bitrateHistory));
    const minBitrate = Math.min(0, Math.min(...bitrateHistory));

    // Criar gradiente profissional como na imagem
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.6)');   // Vermelho no topo
    gradient.addColorStop(0.3, 'rgba(255, 159, 67, 0.4)');  // Laranja
    gradient.addColorStop(0.7, 'rgba(72, 187, 120, 0.3)');  // Verde
    gradient.addColorStop(1, 'rgba(72, 187, 120, 0.1)');    // Verde transparente

    // Desenhar área preenchida
    if (bitrateHistory.length > 1) {
      const points: [number, number][] = bitrateHistory.map((bitrate, index) => [
        (index / (bitrateHistory.length - 1)) * width,
        height - ((bitrate - minBitrate) / (maxBitrate - minBitrate)) * height
      ]);

      // Área preenchida
      ctx.beginPath();
      ctx.moveTo(0, height);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Linha principal suave
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i][0] + points[i - 1][0]) / 2;
        const yc = (points[i][1] + points[i - 1][1]) / 2;
        ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1], xc, yc);
      }
      
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ponto atual
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b6b';
      ctx.fill();
    }

    // Labels profissionais
    ctx.fillStyle = '#666';
    ctx.font = '10px Consolas';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(minBitrate)} kbps`, 5, height - 5);
    ctx.fillText(`${Math.round(maxBitrate)} kbps`, 5, 15);
    
    ctx.textAlign = 'right';
    ctx.fillText('2min', width - 5, height - 5);
    ctx.fillText('agora', width - 5, height - 15);

  }, [bitrateHistory, targetBitrate]);

  return (
    <div className="professional-bitrate-graph">
      <div className="graph-header-pro">
        <span className="graph-title">BITRATE ANALYSIS</span>
        <div className="graph-values">
          <span className="current-value">{currentBitrate}</span>
          <span className="unit">kbps</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="bitrate-canvas-pro" />
      <div className="graph-stats-pro">
        <div className="stat-pro">
          <span className="label">Target:</span>
          <span className="value">{targetBitrate} kbps</span>
        </div>
        <div className="stat-pro">
          <span className="label">Actual:</span>
          <span className="value">{currentBitrate} kbps</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalBitrateGraph;