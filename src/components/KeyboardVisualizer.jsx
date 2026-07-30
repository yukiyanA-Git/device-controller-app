import React from 'react';

export default function KeyboardVisualizer({ telemetry, active }) {
  const lastKey = telemetry?.lastKey || '-';
  const count = telemetry?.keyCount || 0;

  return (
    <div className="keyboard-visualizer">
      <div className="kb-display-row">
        <div className="key-display-box">
          <span className="key-label">最新キー:</span>
          <span className={`key-capsule ${active ? 'active-pulse' : ''}`}>{lastKey}</span>
        </div>
        <div className="key-count-box">
          <span className="count-label">累計入力:</span>
          <span className="count-number">{count.toLocaleString()} <small>打鍵</small></span>
        </div>
      </div>
    </div>
  );
}
