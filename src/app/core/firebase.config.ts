// من Firebase Console → Project settings → General → Your apps (Web app)
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
// من Firebase Console → Project settings → Cloud Messaging → Web Push certificates → Key pair
export const VAPID_KEY = 'YOUR_VAPID_PUBLIC_KEY';

export const firebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_') && !VAPID_KEY.startsWith('YOUR_');
