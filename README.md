# 🎮 InputNexus - PCマルチ入力デバイス統合マネージャー & リアルタイムアナライザー

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D4.svg)](https://microsoft.com)
[![Web-Standard](https://img.shields.io/badge/Web%20APIs-WebHID%20%7C%20Gamepad-00F0FF.svg)](https://developer.mozilla.org)
[![CPU Usage](https://img.shields.io/badge/CPU%20Usage-0.0%25%20Ultra--Light-00FF88.svg)](#-超軽量設計)

PCに同時接続された**ゲームコントローラー、キーボード、左手デバイス（Razer Tartarus等）、マウス、VR機器、フットペダル、Bluetooth機器**の入力信号をリアルタイムに視覚化し、「どれが今反応しているか」を一目で識別＆ワンタップでON/OFF（有効化・無効化・ソフトミュート）できる高機能入力管理アプリケーションです。

---

## ✨ 主な特徴

- ⚡ **リアルタイム発光アクティビティパルス**: キー押下、ボタン操作、スティック傾き、マウス移動に反応してカードがネオンパルス発光。
- 🟢/🟡/🔴 **カテゴリ独立 & 主従ステータス管理**:
  - 🟢 `MAIN` (アクティブ) / 🟡 `NEXT` (次回自動有効化候補) / 🔴 `OFF` (無効)
  - 左手デバイスをONにしてもメインキーボードが誤って勝手にOFFにならない**安全トグル設計**。
- 🎮 **フルスクリーンゲーム対応「ミニHUDモード」**:
  - `Alt + Shift + D` で画面隅に常駐する超小型オーバーレイへ即座に切替。
  - **半透明スライダー (20%〜100%)** でゲーム画面を妨げずに設置可能。
- 🥽 **VR機器 & フットペダル自動識別**:
  - USB Vendor ID / Product ID および HID Usage Class による自動カテゴリ分類。
- 🚀 **CPU負荷 0.0% 超軽量動作**:
  - ゲームのフレームレート（FPS）低下や入力遅延（インプットラグ）を一切起こさないハードウェアアクセラレーション設計。
- 📱 **スマホ / サブモニター連携**:
  - PC画面に一切重ねず、手元のスマホやサブ画面からタッチ操作で入力状態を制御可能。

---

## 🚀 使い方・起動方法

### 方法 1: デスクトップアプリとして起動 (`Launch-InputNexus.bat`)
`Launch-InputNexus.bat` をダブルクリックするだけで、アドレスバーのない独立したネイティブデスクトップアプリウィンドウとして即座に起動します。

### 方法 2: Windowsにインストール (`Install-InputNexus.ps1`)
`Install-InputNexus.ps1` を右クリックして「PowerShell で実行」を選択すると、デスクトップおよびスタートメニューに専用ショートカットアイコンが作成されます。

### 方法 3: ブラウザで直接開く (`index_standalone.html`)
`index_standalone.html` をダブルクリックして、EdgeやChromeなどのブラウザで即座に起動できます。

---

## 📤 友人・他ユーザーへの配布方法

本リポジトリに含まれる `InputNexus_Package.zip` をそのまま送信するか、`index_standalone.html` を相手に渡すだけで、他のPCでもインストール不要で即座にご利用いただけます。

---

## 🌐 Firebase Hosting 無料Webデプロイ対応

`firebase.json` を同梱しており、以下の手順でWeb上に無料公開できます：

```bash
# 1. ビルド
npm run build

# 2. Firebaseへデプロイ
npx firebase deploy
```

---

## 📄 ライセンス

MIT License
