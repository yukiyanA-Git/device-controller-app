import React from 'react';
import { Power, Maximize2, RefreshCw, Zap, Shield, HelpCircle } from 'lucide-react';

export default function CompactHud({ devices, onToggle, onToggleAll, onSwitchToFull, onScan }) {
  return (
    <div className="compact-hud-overlay">
      <div className="hud-window">
        {/* HUD Top Bar */}
        <div className="hud-header">
          <div className="hud-brand">
            <Zap className="brand-bolt" />
            <span className="brand-name">InputNexus Mini HUD</span>
            <span className="hotkey-badge" title="フル表示に戻すショートカット">Alt + Shift + D</span>
          </div>

          <div className="hud-controls">
            <button className="hud-btn" onClick={() => onToggleAll(true)} title="全デバイスON">
              <Power className="btn-icon text-green" /> 全ON
            </button>
            <button className="hud-btn" onClick={() => onToggleAll(false)} title="全デバイスOFF">
              <Power className="btn-icon text-red" /> 全OFF
            </button>
            <button className="hud-btn" onClick={onScan} title="新デバイスをスキャン">
              <RefreshCw className="btn-icon" />
            </button>
            <button className="hud-btn primary" onClick={onSwitchToFull} title="大画面ダッシュボードへ拡大">
              <Maximize2 className="btn-icon" />
            </button>
          </div>
        </div>

        {/* Compact Horizontal Device Cards Grid */}
        <div className="hud-device-list">
          {devices.map(device => {
            const isRecentlyActive = Date.now() - device.lastActive < 1800;
            return (
              <div 
                key={device.id} 
                className={`hud-card ${device.enabled ? 'enabled' : 'disabled'} ${isRecentlyActive ? 'active-glow' : ''}`}
              >
                <div className="hud-card-info">
                  <div className="hud-card-top">
                    <span className={`hud-status-dot ${device.status.toLowerCase()}`} />
                    <span className="hud-device-name" title={device.name}>{device.name}</span>
                  </div>
                  <div className="hud-card-sub">
                    <span className="hud-cat-tag">{device.category}</span>
                    {device.status === 'NEXT' && <span className="hud-next-tag">NEXT</span>}
                    {isRecentlyActive && <span className="hud-pulse-tag">⚡入力中</span>}
                  </div>
                </div>

                <button 
                  className={`hud-toggle-btn ${device.enabled ? 'on' : 'off'}`}
                  onClick={() => onToggle(device.id)}
                  title={device.enabled ? "OFFにする" : "ONにする"}
                >
                  {device.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="hud-footer">
          <span>💡 コントローラー・キーボードを操作すると枠が光り、反応元を即座に識別できます</span>
        </div>
      </div>
    </div>
  );
}
