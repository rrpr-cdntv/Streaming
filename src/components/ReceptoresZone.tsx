import React, { useState } from 'react';

interface Receptor {
  id: number;
  name: string;
  // ... resto das interfaces
/* Receptores Zone */
.receptores-zone {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.receptores-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}

.receptores-header h2 {
  margin: 0;
  font-size: 20px;
  color: #fff;
  font-weight: 600;
}

.receptores-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: #888;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

/* Grid de Receptores */
.receptores-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.receptor-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.receptor-card:hover {
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.receptor-card.live {
  border-color: #4caf50;
  box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.3);
}

.receptor-card.connecting {
  border-color: #ff9800;
  box-shadow: 0 0 0 1px rgba(255, 152, 0, 0.3);
}

/* Monitor de Vídeo */
.receptor-monitor {
  position: relative;
  background: #000;
  border-radius: 8px;
  height: 120px;
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid #333;
}

.monitor-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  text-align: center;
  color: #fff;
}

.video-signal {
  font-size: 32px;
  margin-bottom: 8px;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.video-res {
  font-size: 12px;
  font-weight: 600;
}

.video-bitrate {
  font-size: 10px;
  color: #888;
}

.connecting-animation {
  text-align: center;
  color: #ff9800;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #333;
  border-top: 2px solid #ff9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 8px;
}

.connecting-text {
  font-size: 12px;
  font-weight: 500;
}

.no-signal {
  text-align: center;
  color: #666;
}

.no-signal-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.no-signal-text {
  font-size: 12px;
  font-weight: 500;
}

/* Status Overlay */
.monitor-status {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.status-indicator {
  font-size: 12px;
}

/* Informações do Receptor */
.receptor-info {
  margin-bottom: 12px;
}

.receptor-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.receptor-url {
  font-size: 11px;
  color: #888;
  font-family: 'Consolas', monospace;
  word-break: break-all;
}

/* Audio Meters dos Receptores */
.receptor-audio {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.audio-meter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.channel-label {
  width: 12px;
  font-weight: 600;
  color: #ccc;
}

.meter-bar {
  flex: 1;
  height: 12px;
  background: #333;
  border-radius: 2px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 70%, #ffc107 85%, #ff5722 100%);
  transition: width 0.1s ease;
}

.meter-db {
  width: 30px;
  text-align: right;
  font-family: 'Consolas', monospace;
  font-size: 9px;
  color: #888;
}

/* Controles do Receptor */
.receptor-controls {
  display: flex;
  justify-content: space-between;
}

.control-btn {
  background: #333;
  border: 1px solid #444;
  color: #ccc;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #444;
  border-color: #555;
}

/* Adicionar Receptor */
.add-receptor {
  text-align: center;
}

.add-receptor-btn {
  background: linear-gradient(135deg, #2d7a5f 0%, #3a9b78 100%);
  border: none;
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.add-receptor-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 122, 95, 0.3);
}

.add-icon {
  font-size: 16px;
}

.add-text {
  font-size: 12px;
  letter-spacing: 1px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}