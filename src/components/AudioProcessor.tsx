import React, { useEffect, useRef, useState } from 'react';

interface AudioProcessorProps {
  onAudioData: (levels: { left: number; right: number }) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isStreaming: boolean;
}

const AudioProcessor: React.FC<AudioProcessorProps> = ({ 
  onAudioData, 
  isMuted, 
  onMuteToggle,
  isStreaming 
}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const animationRef = useRef<number>();

  // Inicializar audio context
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 2
        }
      });

      const context = new AudioContext({ sampleRate: 48000 });
      const source = context.createMediaStreamSource(stream);
      const analyzerNode = context.createAnalyser();
      
      // Configuração profissional do analyser
      analyzerNode.fftSize = 512;
      analyzerNode.smoothingTimeConstant = 0.3;
      analyzerNode.minDecibels = -90;
      analyzerNode.maxDecibels = -10;

      source.connect(analyzerNode);

      setAudioContext(context);
      setAnalyser(analyzerNode);
      setMediaStream(stream);
      setIsActive(true);

      // Começar análise
      startAnalysis(analyzerNode);
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
    }
  };

  // Análise em tempo real
  const startAnalysis = (analyzerNode: AnalyserNode) => {
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isActive) return;

      analyzerNode.getByteFrequencyData(dataArray);

      // Calcular níveis de áudio (simulação stereo)
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / bufferLength;
      const normalizedLevel = (average / 255) * 100;

      // Simular canais L/R com pequena variação
      const leftLevel = Math.min(100, normalizedLevel + (Math.random() - 0.5) * 10);
      const rightLevel = Math.min(100, normalizedLevel + (Math.random() - 0.5) * 10);

      onAudioData({
  left: (isMuted || !isStreaming) ? 0 : Math.max(0, leftLevel),
  right: (isMuted || !isStreaming) ? 0 : Math.max(0, rightLevel)
});

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  // Cleanup
  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsActive(false);
  };

  useEffect(() => {
    initializeAudio();
    return cleanup;
  }, []);

  return (
    <div className="audio-processor">
      <div className="audio-controls">
        <button 
          onClick={onMuteToggle}
          className={`mute-btn ${isMuted ? 'muted' : 'active'}`}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <span className="audio-status">
          {isActive ? 'AUDIO ACTIVE' : 'INITIALIZING...'}
        </span>
      </div>
    </div>
  );
};

export default AudioProcessor;