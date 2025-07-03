import React, { useState } from 'react';

export type TabType = 'preview' | 'receptores' | 'webcam' | 'screen' | 'media' | 'ndi' | 'rist';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

interface TabSystemProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSystem: React.FC<TabSystemProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { id: 'preview', label: 'Preview', icon: '📺' },
    { id: 'receptores', label: 'Receptores', icon: '📡', badge: '4' },
    { id: 'webcam', label: 'Webcam', icon: '📷' },
    { id: 'screen', label: 'Screen Capture', icon: '🖥️' },
    { id: 'media', label: 'Media Files', icon: '📁' },
    { id: 'ndi', label: 'NDI Sources', icon: '📊' },
    { id: 'rist', label: 'RIST Bonding', icon: '🔗', badge: 'DEV' }
  ];

  return (
    <div className="tab-system">
      <div className="tab-header">
        <div className="tab-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
            >
              <div className="tab-icon">{tab.icon}</div>
              <div className="tab-label">{tab.label}</div>
              {tab.badge && (
                <div className={`tab-badge ${tab.badge === 'DEV' ? 'dev' : 'count'}`}>
                  {tab.badge}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabSystem;