import React from 'react';
import { Sliders, CheckCircle, Crosshair, Car, Laptop, ShieldOff } from 'lucide-react';

export default function PresetManager({ devices, onApplyPreset }) {
  const PRESETS = [
    {
      id: 'fps',
      name: 'FPSゲームモード',
      icon: Crosshair,
      desc: 'メインキーボード＋マウスのみON。余計なパッド・誤判定デバイスを遮断。',
      filter: (d) => d.id === 'kb_main' || d.id === 'mouse_superlight'
    },
    {
      id: 'sim',
      name: 'レース/飛行シミュレータ',
      icon: Car,
      desc: 'コントローラー/ハンコン＋メインキーボードON。サブマイク/マウス無効化。',
      filter: (d) => d.category === 'gamepad' || d.id === 'kb_main'
    },
    {
      id: 'lefthand',
      name: '左手デバイス＋キーボード複合モード',
      icon: Laptop,
      desc: 'メインキーボード＋Razer Tartarus等左手キーパッド＋マウスをON。',
      filter: (d) => d.category === 'keyboard' || d.category === 'mouse'
    },
    {
      id: 'all_off',
      name: '全デバイス緊急ソフトミュート',
      icon: ShieldOff,
      desc: '一時的にすべての入力信号を安全にミュート（離席時用）。',
      filter: () => false
    }
  ];

  return (
    <div className="preset-manager-card">
      <div className="preset-header">
        <Sliders className="preset-icon" />
        <div>
          <h3>クイックプリセット切り替え</h3>
          <p className="preset-sub">用途に合わせてワンクリックで複数デバイスのON/OFFを一括変更</p>
        </div>
      </div>

      <div className="presets-grid">
        {PRESETS.map((preset) => {
          const IconComponent = preset.icon;
          return (
            <button
              key={preset.id}
              className="preset-btn"
              onClick={() => onApplyPreset(preset.filter, preset.name)}
            >
              <div className="preset-btn-top">
                <IconComponent className="preset-btn-icon" />
                <span className="preset-name">{preset.name}</span>
              </div>
              <p className="preset-desc">{preset.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
