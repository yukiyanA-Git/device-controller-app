import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Download, Upload, ExternalLink } from 'lucide-react';
import { getDeploymentGuide } from '../services/firebase';

export default function ShareExportModal({ isOpen, onClose, devices }) {
  const [copied, setCopied] = useState(false);
  const guide = getDeploymentGuide();

  if (!isOpen) return null;

  const exportConfigJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(devices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "input_nexus_devices_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(guide.steps.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <Share2 className="modal-icon text-cyan" />
            <h2>他ユーザーへの配布＆Firebase Hosting無料公開設定</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <div className="modal-body">
          <div className="share-section">
            <h3><Globe className="section-icon" /> 1. Firebase HostingによるWeb無料公開手順</h3>
            <p className="share-desc">
              このアプリはWeb標準APIで動作するため、Firebase Hostingに1コマンドで無料デプロイすれば、他の人がインストール不要でブラウザから即座に利用できます！
            </p>
            
            <div className="code-block">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="code-line">{step}</div>
              ))}
            </div>

            <button className="action-btn-secondary" onClick={handleCopyGuide}>
              {copied ? <Check className="icon-sm text-green" /> : <Copy className="icon-sm" />}
              {copied ? '手順をコピーしました！' : 'デプロイ手順をコピー'}
            </button>
          </div>

          <hr className="modal-divider" />

          <div className="share-section">
            <h3><Download className="section-icon" /> 2. 現在のデバイス設定・構成の共有 (JSON)</h3>
            <p className="share-desc">
              あなたのおすすめ入力デバイス構成や名前にカスタムラベルを付けた状態をJSONファイルとして書き出し、友達やコミュニティへ渡すことができます。
            </p>

            <button className="action-btn-primary" onClick={exportConfigJSON}>
              <Download className="icon-sm" /> デバイス設定ファイル (.json) をダウンロード
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn-flat" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
