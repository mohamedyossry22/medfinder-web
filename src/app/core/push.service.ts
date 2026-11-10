import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { initializeApp, getApps } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { ApiService } from './api.service';
import { VAPID_KEY, firebaseConfig, firebaseConfigured } from './firebase.config';

export type PushResult = 'ok' | 'denied' | 'unsupported' | 'not_configured' | 'error';

/** إشعارات الويب عبر FCM (بتشتغل والتاب مقفول). SignalR بيغطي الحالة والتاب مفتوح. */
@Injectable({ providedIn: 'root' })
export class PushService {
  private api = inject(ApiService);
  readonly active = signal(false);
  private token: string | null = null;

  private messaging() {
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    return getMessaging(app);
  }

  async enable(): Promise<PushResult> {
    if (!firebaseConfigured) return 'not_configured';
    if (!('serviceWorker' in navigator) || !(await isSupported())) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return 'denied';
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(this.messaging(), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      if (!token) return 'error';
      await firstValueFrom(this.api.registerDevice(token));
      this.token = token;
      this.active.set(true);
      return 'ok';
    } catch { return 'error'; }
  }

  /** لو الصلاحية متوافق عليها قبل كده: نجدد الـ token بهدوء من غير ما نسأل تاني */
  async resume() {
    if (firebaseConfigured && 'Notification' in window && Notification.permission === 'granted') await this.enable();
  }

  async unregister() {
    const t = this.token;
    this.active.set(false); this.token = null;
    if (!t) return;
    try { await firstValueFrom(this.api.unregisterDevice(t)); } catch { /* ignore */ }
    try { await deleteToken(this.messaging()); } catch { /* ignore */ }
  }
}
