import React from 'react';

export default function GamepadVisualizer({ telemetry, active }) {
  const axes = telemetry?.axes || [0, 0, 0, 0];
  const buttons = telemetry?.buttons || [];
  const lastBtn = telemetry?.lastButton || '-';

  const leftStickX = Math.round((axes[0] || 0) * 20);
  const leftStickY = Math.round((axes[1] || 0) * 20);

  return (
    <div className="gamepad-visualizer">
      <div className="visualizer-header">
        <span className="last-input-tag">最終入力: {lastBtn}</span>
      </div>

      <div className="gamepad-layout">
        {/* Left Joystick Indicator */}
        <div className="joystick-container" title="Lスティック軸">
          <div className="joystick-ring">
            <div 
              className={`joystick-thumb ${active ? 'active-pulse' : ''}`}
              style={{ transform: `translate(${leftStickX}px, ${leftStickY}px)` }}
            />
          </div>
          <span className="joystick-label">L-Stick</span>
        </div>

        {/* Action Button Grid */}
        <div className="button-grid">
          {['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'].map((name, i) => (
            <div 
              key={name} 
              className={`gp-btn-pill ${buttons[i] ? 'pressed' : ''}`}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
