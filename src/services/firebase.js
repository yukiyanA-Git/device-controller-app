/**
 * Firebase Config and Hosting Helper for InputNexus
 * Users can easily plug in their free Firebase Config to sync profiles online,
 * or host the web application on Firebase Hosting.
 */

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "input-nexus.firebaseapp.com",
  projectId: "input-nexus",
  storageBucket: "input-nexus.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

export const getDeploymentGuide = () => {
  return {
    steps: [
      "1. Firebase Console (https://console.firebase.google.com/) で無料プロジェクトを作成",
      "2. ターミナルで `npx firebase login` を実行",
      "3. `npm run build` を実行して最新のWebアプリをビルド",
      "4. `npx firebase deploy` を実行すると、全世界に無料で公開できるWebアプリURLが発行されます！"
    ]
  };
};
