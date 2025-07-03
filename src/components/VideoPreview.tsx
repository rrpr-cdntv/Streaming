import React, { useEffect, useRef, useState } from 'react';

interface VideoPreviewProps {
  isActive: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Enumerar dispositivos de vídeo
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        setError('Erro ao enumerar dispositivos');
      }
    };

    getDevices();
  }, []);

  // Iniciar capture de vídeo
  const startVideoCapture = async (deviceId: string) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError('Erro ao capturar vídeo');
      console.error(err);
    }
  };

  // Parar capture
  const stopVideoCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Iniciar/parar baseado no estado
  useEffect(() => {
    if (isActive && selectedDevice) {
      startVideoCapture(selectedDevice);
    } else {
      stopVideoCapture();
    }

    return () => stopVideoCapture();
  }, [isActive, selectedDevice]);

  return (
    <div className="video-preview">
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      
      <video 
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="preview-video"
      />
      
      {!isActive && (
        <div className="preview-overlay">
          <div className="preview-icon">📷</div>
          <div className="preview-text">PREVIEW</div>
          <div className="preview-status">
            {devices.length > 0 ? 'Pronto para capturar' : 'Nenhuma câmara detectada'}
          </div>
        </div>
      )}

      {devices.length > 0 && (
        <div className="device-selector">
          <select 
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="device-dropdown"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Câmara ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;