import React from 'react';
import GamepadVisualizer from './GamepadVisualizer';
import KeyboardVisualizer from './KeyboardVisualizer';
import MouseVisualizer from './MouseVisualizer';
import { Gamepad, Keyboard, Mouse, Bluetooth, Usb, Power, ShieldAlert, Zap } from 'lucide-react';

export default function DeviceCard({ device, onToggle }) {
  const isRecentlyActive = Date.now() - device.lastActive < 1800;

  const getCategoryIcon = () => {
    switch (device.category) {
      case 'gamepad': return <Gamepad className="icon-main" />;
      case 'keyboard': return <Keyboard className="icon-main" />;
      case 'mouse': return <Mouse className="icon-main" />;
      default: return <Zap className="icon-main" />;
    }
  };

  const getStatusBadge = () => {
    switch (device.status) {
      case 'ACTIVE':
        return <span className="status-badge active"><span className="dot"></span> 🟢 MAIN (アクティブ)</span>;
      case 'NEXT':
        return <span className="status-badge next"><span className="dot"></span> 🟡 NEXT (次回有効候補)</span>;
      default:
        return <span className="status-badge off"><span className="dot"></span> 🔴 OFF (無効)</span>;
    }
  };

  return (
    <div className={`device-card ${device.enabled ? 'enabled' : 'disabled'} ${isRecentlyActive ? 'pulse-glow' : ''}`}>
      {/* Header Info */}
      <div className="card-header">
        <div className="device-identity">
          <div className={`category-icon-wrapper ${isRecentlyActive ? 'active-glow' : ''}`}>
            {getCategoryIcon()}
          </div>
          <div className="title-area">
            <h3 className="device-name">{device.name}</h3>
            <div className="device-sub-meta">
              <span className="conn-tag">
                {device.connection === 'bluetooth' ? <Bluetooth className="icon-sub" /> : <Usb className="icon-sub" />}
                {device.connection.toUpperCase()}
              </span>
              <span className="id-tag">{device.vendorId}:{device.productId}</span>
            </div>
          </div>
        </div>

        {/* ON / OFF Switch */}
        <div className="card-actions">
          <button 
            className={`toggle-switch ${device.enabled ? 'on' : 'off'}`}
            onClick={() => onToggle(device.id)}
            title={device.enabled ? "クリックして無効化（OFF）" : "クリックして有効化（ON）"}
          >
            <Power className="power-icon" />
            <span>{device.enabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Status Badge & Priority Line */}
      <div className="card-status-bar">
        {getStatusBadge()}
        {isRecentlyActive && (
          <span className="pulse-indicator">⚡ 入力検知中！</span>
        )}
      </div>

      {/* Specific Visualizer Section */}
      <div className="card-body">
        {device.enabled ? (
          <>
            {device.category === 'gamepad' && <GamepadVisualizer telemetry={device.telemetry} active={isRecentlyActive} />}
            {device.category === 'keyboard' && <KeyboardVisualizer telemetry={device.telemetry} active={isRecentlyActive} />}
            {device.category === 'mouse' && <MouseVisualizer telemetry={device.telemetry} active={isRecentlyActive} />}
          </>
        ) : (
          <div className="muted-notice">
            <ShieldAlert className="muted-icon" />
            <span>このデバイスは現在OFF（ソフトミュート状態）です。入力は無視されます。</span>
          </div>
        )}
      </div>
    </div>
  );
}
