/* Service worker لإشعارات FCM (بتوصل حتى لو التاب مقفول).
   لازم نفس بيانات app/core/firebase.config.ts (الـ SW مش بيقدر يستورد من Angular). */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
});

// الإشعار نفسه (title/body) بيتعرض أوتوماتيك من الـ SDK لأن الباك إند بيبعت notification payload.
firebase.messaging();
