import React from 'react';

export default function MouseVisualizer({ telemetry, active }) {
  const speed = telemetry?.speed || 0;
  const buttons = telemetry?.buttons || [false, false, false];
  const lastAction = telemetry?.lastAction || '停止中';

  return (
    <div className="mouse-visualizer">
      <div className="mouse-display-row">
        <div className="mouse-buttons-row">
          <span className={`m-btn ${buttons[0] ? 'active' : ''}`}>L-Click</span>
          <span className={`m-btn ${buttons[1] ? 'active' : ''}`}>Mid</span>
          <span className={`m-btn ${buttons[2] ? 'active' : ''}`}>R-Click</span>
        </div>
        <div className="mouse-speed-gauge">
          <span className="speed-label">速度: {speed} px/f</span>
          <div className="gauge-track">
            <div 
              className={`gauge-fill ${active ? 'active-pulse' : ''}`}
              style={{ width: `${Math.min(100, speed * 2)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
