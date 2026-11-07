import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web app config (public client identifiers, safe to ship in the bundle)
const firebaseConfig = {
  apiKey: 'AIzaSyDxiKrLEPuQJSWmdmxEDAnZyboUPo9rUuQ',
  authDomain: 'medfinder-8c4ed.firebaseapp.com',
  projectId: 'medfinder-8c4ed',
  storageBucket: 'medfinder-8c4ed.firebasestorage.app',
  messagingSenderId: '1093843197820',
  appId: '1:1093843197820:web:cb2d5dfd46ea819ee40ef9',
  measurementId: 'G-BK39V694TP'
};

export const firebaseApp = initializeApp(firebaseConfig);

/** Analytics is only available in supported browsers (not SSR / some privacy modes), so resolve to null otherwise. */
export const analytics = isSupported().then(ok => (ok ? getAnalytics(firebaseApp) : null));
