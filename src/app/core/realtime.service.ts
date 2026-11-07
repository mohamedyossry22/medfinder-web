import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { API } from './config';
import { AuthService } from './auth.service';
import { IncomingRequest } from './models';

/** اتصال SignalR: الطلبات الجديدة بتوصل لايف من غير Refresh */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private auth = inject(AuthService);
  private hub?: signalR.HubConnection;
  private retry?: ReturnType<typeof setTimeout>;
  private stopped = false;

  readonly connected = signal(false);
  readonly newRequest$ = new Subject<IncomingRequest>();
  /** بعد انقطاع واتصال تاني: لازم نعيد تحميل القوائم لأن ممكن نكون فوّتنا أحداث */
  readonly reconnected$ = new Subject<void>();

  async start() {
    if (this.hub) return;
    this.stopped = false;
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/notifications`, { accessTokenFactory: () => this.auth.session()?.token ?? '' })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    this.hub.on('NewRequest', (r: IncomingRequest) => this.newRequest$.next(r));
    this.hub.onreconnecting(() => this.connected.set(false));
    this.hub.onreconnected(() => { this.connected.set(true); this.reconnected$.next(); });
    this.hub.onclose(() => { this.connected.set(false); this.scheduleRetry(); });

    await this.connect();
  }

  private async connect() {
    try { await this.hub?.start(); this.connected.set(true); this.reconnected$.next(); }
    catch { this.connected.set(false); this.scheduleRetry(); }
  }

  private scheduleRetry() {
    if (this.stopped || !this.hub) return;
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.connect(), 5000);
  }

  async stop() {
    this.stopped = true;
    clearTimeout(this.retry);
    const h = this.hub; this.hub = undefined;
    this.connected.set(false);
    try { await h?.stop(); } catch { /* ignore */ }
  }
}
