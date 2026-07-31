# 🎮 InputNexus - PCマルチ入力デバイス統合マネージャー & リアルタイムアナライザー

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D4.svg)](https://microsoft.com)
[![Web-Standard](https://img.shields.io/badge/Web%20APIs-WebHID%20%7C%20Gamepad-00F0FF.svg)](https://developer.mozilla.org)
[![CPU Usage](https://img.shields.io/badge/CPU%20Usage-0.0%25%20Ultra--Light-00FF88.svg)](#-超軽量設計)

---

## 🚀 配布・ご利用方法（ハイブリッド形式）

用途や相手に合わせて、**2つの方法**でご利用・配布が可能です！

### 🌐 1. インストール不要・Webブラウザで今すぐ使う (Firebase Hosting版)
> 📱 **スマホ・サブモニター・他ユーザーへの共有に最適**  
> ダウンロードや設定不要。URLを開くだけで1秒で起動します。
- 👉 **[InputNexus Web版を起動する (Firebase)](https://input-nexus.web.app)** *(※Firebaseデプロイ後リンク)*

---

### 📦 2. PCにダウンロード・デスクトップアプリとして使う (GitHub / Zip版)
> 💻 **オフライン環境・デスクトップ直起動・スタートメニュー登録に最適**  
- 📥 **[InputNexus_Package.zip をダウンロード](https://github.com/yukiyanA-Git/device-controller-app/raw/main/InputNexus_Package.zip)**
- 使い方:
  - 解凍して `Launch-InputNexus.bat` を押すとデスクトップアプリとして起動します。
  - `Install-InputNexus.ps1` を右クリック➔PowerShell実行で、デスクトップ＆スタートメニューにショートカットが自動登録されます。

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

---

## 🛠️ 開発者・Firebaseデプロイ手順

```bash
# ビルド
npm run build

# Firebase Hostingへの公開
npx firebase deploy
```

---

## 📄 ライセンス

MIT License
