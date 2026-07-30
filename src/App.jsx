import React, { useState, useEffect } from 'react';
import { deviceManager } from './services/deviceManager';
import DeviceCategoryGroup from './components/DeviceCategoryGroup';
import CompactHud from './components/CompactHud';
import PresetManager from './components/PresetManager';
import ShareExportModal from './components/ShareExportModal';
import { 
  Gamepad, 
  Keyboard, 
  Mouse, 
  Bluetooth, 
  Zap, 
  RefreshCw, 
  Power, 
  Minimize2, 
  Share2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [devices, setDevices] = useState([]);
  const [toast, setToast] = useState(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConnection, setFilterConnection] = useState('all'); // all, usb, bluetooth

  useEffect(() => {
    const unsubscribe = deviceManager.subscribe((updatedDevices, activeToast) => {
      setDevices(updatedDevices);
      setToast(activeToast);
    });

    // Global shortcut Alt+Shift+D to toggle compact view
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsCompactView(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = (id) => {
    deviceManager.toggleDevice(id);
  };

  const handleToggleAll = (enable) => {
    deviceManager.toggleAll(enable);
  };

  const handleScan = () => {
    deviceManager.scanForDevices();
  };

  const handleApplyPreset = (filterFn, presetName) => {
    devices.forEach(d => {
      const shouldEnable = filterFn(d);
      if (d.enabled !== shouldEnable) {
        deviceManager.toggleDevice(d.id);
      }
    });
    deviceManager.setToast(`プリセット [${presetName}] を適用しました。`);
  };

  // Filtered devices for rendering
  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.vendorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConn = filterConnection === 'all' || d.connection === filterConnection;
    return matchesSearch && matchesConn;
  });

  const activeCount = devices.filter(d => d.enabled).length;
  const totalCount = devices.length;

  if (isCompactView) {
    return (
      <CompactHud 
        devices={devices}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
        onSwitchToFull={() => setIsCompactView(false)}
        onScan={handleScan}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="toast-notification animate-slide-down">
          <AlertCircle className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <Zap className="logo-icon" />
          </div>
          <div>
            <h1 className="app-title">InputNexus <span className="version-tag">v1.0</span></h1>
            <p className="app-subtitle">マルチ入力デバイス リアルタイムアナライザー & 優先度トグルマネージャー</p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="header-actions">
          <button 
            className="action-btn secondary" 
            onClick={() => setIsCompactView(true)}
            title="フルスクリーンゲームに最適なミニHUDへ切替 (Alt+Shift+D)"
          >
            <Minimize2 className="btn-icon" />
            <span>ミニHUDモード</span>
          </button>

          <button 
            className="action-btn secondary" 
            onClick={handleScan}
            title="接続されたBluetooth/USBデバイスを再検出"
          >
            <RefreshCw className="btn-icon" />
            <span>再スキャン</span>
          </button>

          <button 
            className="action-btn primary" 
            onClick={() => setIsShareModalOpen(true)}
            title="他人への配布・Firebase Hosting公開"
          >
            <Share2 className="btn-icon" />
            <span>配布＆Web公開</span>
          </button>
        </div>
      </header>

      {/* Control Summary & Quick Toggles Bar */}
      <section className="status-summary-bar">
        <div className="summary-stats">
          <div className="stat-pill">
            <span className="stat-label">接続済みデバイス:</span>
            <span className="stat-value">{totalCount} 台</span>
          </div>
          <div className="stat-pill active">
            <span className="stat-label">現在ON (有効):</span>
            <span className="stat-value text-green">{activeCount} 台</span>
          </div>
          <div className="stat-pill muted">
            <span className="stat-label">OFF (ミュート中):</span>
            <span className="stat-value text-red">{totalCount - activeCount} 台</span>
          </div>
        </div>

        {/* Search & Filter Inputs */}
        <div className="filter-controls">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="デバイス名・Vendor IDで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="segmented-filter">
            <button 
              className={`segment-btn ${filterConnection === 'all' ? 'active' : ''}`}
              onClick={() => setFilterConnection('all')}
            >すべて</button>
            <button 
              className={`segment-btn ${filterConnection === 'usb' ? 'active' : ''}`}
              onClick={() => setFilterConnection('usb')}
            >USB</button>
            <button 
              className={`segment-btn ${filterConnection === 'bluetooth' ? 'active' : ''}`}
              onClick={() => setFilterConnection('bluetooth')}
            >Bluetooth</button>
          </div>

          <div className="global-toggles">
            <button className="mini-toggle-btn on" onClick={() => handleToggleAll(true)}>一括 ON</button>
            <button className="mini-toggle-btn off" onClick={() => handleToggleAll(false)}>一括 OFF</button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="app-main-content">
        {/* Quick Presets Section */}
        <PresetManager devices={devices} onApplyPreset={handleApplyPreset} />

        {/* Device Categories */}
        <DeviceCategoryGroup 
          title="コントローラー & ゲームパッド"
          icon={Gamepad}
          category="gamepad"
          devices={filteredDevices}
          onToggle={handleToggle}
        />

        <DeviceCategoryGroup 
          title="キーボード & 左手デバイス (Keypad)"
          icon={Keyboard}
          category="keyboard"
          devices={filteredDevices}
          onToggle={handleToggle}
        />

        <DeviceCategoryGroup 
          title="マウス & ポインティングデバイス"
          icon={Mouse}
          category="mouse"
          devices={filteredDevices}
          onToggle={handleToggle}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>💡 **Tips**: キーボードのキーを押したり、コントローラーのボタンを操作すると、即座に該当するデバイスカードがネオン発光します。</p>
        <p className="shortcut-hint">ショートカット: <code>Alt + Shift + D</code> でコンパクトミニHUDモード切替</p>
      </footer>

      {/* Share & Firebase Deployment Modal */}
      <ShareExportModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        devices={devices}
      />
    </div>
  );
}
