# 🎮 InputNexus Native - PCマルチ入力デバイス統合マネージャー (Windows Native OS連携版)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D4.svg)](https://microsoft.com)
[![Engine](https://img.shields.io/badge/Engine-Windows%20PnP%20Native%20Engine-00F0FF.svg)](#-windows-native-エンジン)
[![CPU Usage](https://img.shields.io/badge/CPU%20Usage-0.0%25%20Ultra--Light-00FF88.svg)](#-超軽量設計)

PCに同時接続された**ゲームコントローラー、キーボード、左手デバイス（Razer Tartarus等）、テンキー、マウス、VR機器、フットペダル、Bluetooth機器**の入力信号をリアルタイムに識別・視覚化し、**Windows OSレベルでの物理無効化/完全停止および個別ON/OFF切り替え**を行えるゲーマー向け超軽量デスクトップアプリケーションです。

---

## ✨ 主な特徴

- ⚡ **リアルタイム発光アクティビティパルス**: キー押下、ボタン操作、スティック傾き、マウス移動に反応して該当カードがネオン発光。
- 🛡️ **Windows OS PnP デバイス物理停止**:
  - アプリ内のON/OFFスイッチ切り替えにより、特定のマウスやキーボードをWindowsレベルで物理切断（カーソル不動・ボタン全無効化）。
  - **誤無効化防止保護**: 動作中の最後の1台のマウスを誤って切断しないセーフティ確認ダイアログ機能。
- 🚨 **緊急一括復旧ショートカット (`Ctrl + Alt + Shift + R`)**:
  - 万が一の操作不可時やPCフリーズ時でも、キーボードショートカット一発ですべての機器の無効化を即座に解除・一括ONリセット。
- ✏️ **機器の自由なニックネーム（命名）保存**:
  - ✏️ アイコンを押すことで、「IBMテンキー」「メインキーボード」「左手Tartarus」など好きな名前に命名・保存可能。
- 🔵 **Bluetooth深層型番抽出 (PnP Registry Direct Query)**:
  - Windows PnPレジストリからBluetooth/USBハードウェアの型番（例: `MX Master 3S`, `8BitDo Controller`）を直接読み出し表示。
- 🎮 **フルスクリーンゲーム対応「ミニHUDモード」**:
  - `Alt + Shift + D` で画面隅に常駐する超小型オーバーレイへ即座に切替。
  - **半透明スライダー (20%〜100%)** でゲーム画面を妨げずに設置可能。
- 🚀 **CPU負荷 0.0% 超軽量動作**:
  - ゲームのフレームレート（FPS）低下や入力遅延（インプットラグ）を一切起こさないハードウェアアクセラレーション設計。

---

## 🚀 使い方・起動方法

### 1. デスクトップアプリとして起動 (`Launch-InputNexus.bat`)
`Launch-InputNexus.bat` をダブルクリックするだけで、アドレスバーのない独立したネイティブデスクトップアプリウィンドウとして即座に起動します。

### 2. Windowsにインストール (`Install-InputNexus.ps1`)
`Install-InputNexus.ps1` を右クリックして「PowerShell で実行」を選択すると、デスクトップおよびスタートメニューに専用ショートカットアイコンが自動作成されます。

---

## 📤 他ユーザーへの配布方法

リポジトリに含まれる `InputNexus_Package.zip` をそのまま送信するか、`index_standalone.html` を相手に渡すだけで、他のPCでもインストール不要で即座にご利用いただけます。

---

## 📄 ライセンス

MIT License
