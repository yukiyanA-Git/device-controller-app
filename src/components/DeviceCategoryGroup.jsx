import React from 'react';
import DeviceCard from './DeviceCard';
import { ArrowRight, HelpCircle } from 'lucide-react';

export default function DeviceCategoryGroup({ title, icon: Icon, category, devices, onToggle }) {
  const groupDevices = devices.filter(d => d.category === category);
  
  if (groupDevices.length === 0) return null;

  const activeDevice = groupDevices.find(d => d.status === 'ACTIVE');
  const nextDevice = groupDevices.find(d => d.status === 'NEXT');

  return (
    <div className="category-group-section">
      <div className="group-header">
        <div className="group-title">
          <Icon className="group-icon" />
          <h2>{title} <span className="count-badge">({groupDevices.length}台接続中)</span></h2>
        </div>

        {/* Next Active Fallback Notice */}
        <div className="fallback-flow-indicator">
          <span className="flow-label">メイン/次回切り替わり順:</span>
          <span className="flow-pill active">{activeDevice ? activeDevice.name : 'なし (全OFF)'}</span>
          <ArrowRight className="flow-arrow" />
          <span className={`flow-pill next ${nextDevice ? '' : 'none'}`}>
            {nextDevice ? `次: ${nextDevice.name}` : '次回候補なし'}
          </span>
        </div>
      </div>

      <div className="cards-grid">
        {groupDevices.map(device => (
          <DeviceCard key={device.id} device={device} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
