import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { RealtimeService } from '../core/realtime.service';
import { IncomingRequest, ReadyItem } from '../core/models';
import { beep } from '../core/sound';

/** حالة صفحات الصيدلية: الواردة + الجاهزة، وبتتحدث لايف من SignalR */
@Injectable({ providedIn: 'root' })
export class PharmacyStore {
  private api = inject(ApiService);
  private rt = inject(RealtimeService);

  readonly incoming = signal<IncomingRequest[]>([]);
  readonly ready = signal<ReadyItem[]>([]);
  readonly fresh = signal<ReadonlySet<string>>(new Set());   // الطلبات الجديدة (للتمييز لحظيًا)
  readonly loading = signal(true);
  readonly now = signal(Date.now());

  // الطلبات اللي خلص وقتها بتختفي أوتوماتيك
  readonly activeIncoming = computed(() => this.incoming().filter(r => Date.parse(r.expiresAt) > this.now()));
  readonly activeReady = computed(() => this.ready().filter(r => Date.parse(r.expiresAt) > this.now()));

  private started = false;
  private subs: Subscription[] = [];
  private timer?: ReturnType<typeof setInterval>;

  async init() {
    if (this.started) return;
    this.started = true;
    this.timer = setInterval(() => this.now.set(Date.now()), 30_000);
    this.subs.push(
      this.rt.newRequest$.subscribe(r => this.onNew(r)),
      this.rt.reconnected$.subscribe(() => this.reload(false)));
    await this.reload(true);
  }

  async reload(showSpinner: boolean) {
    if (showSpinner) this.loading.set(true);
    try {
      const [i, r] = await Promise.all([firstValueFrom(this.api.incoming()), firstValueFrom(this.api.ready())]);
      this.incoming.set(i); this.ready.set(r);
    } finally { this.loading.set(false); }
  }

  private onNew(r: IncomingRequest) {
    if (this.incoming().some(x => x.targetId === r.targetId)) return;
    this.incoming.update(l => [r, ...l]);
    this.fresh.update(s => new Set(s).add(r.targetId));
    setTimeout(() => this.fresh.update(s => { const n = new Set(s); n.delete(r.targetId); return n; }), 15_000);
    beep();
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted')
      new Notification('طلب دواء جديد', { body: `${r.drugNameAr} — ${r.quantity} علبة`, tag: r.targetId });
  }

  drop(targetId: string) { this.incoming.update(l => l.filter(x => x.targetId !== targetId)); }

  async respond(targetId: string, status: 'Available' | 'Partial' | 'Unavailable', qty?: number) {
    await firstValueFrom(this.api.respond(targetId, status, qty));
    this.drop(targetId);
    if (status !== 'Unavailable') this.ready.set(await firstValueFrom(this.api.ready()));
  }

  async deliver(targetId: string) {
    await firstValueFrom(this.api.deliver(targetId));
    this.ready.update(l => l.filter(x => x.targetId !== targetId));
  }

  stop() {
    clearInterval(this.timer);
    this.subs.forEach(s => s.unsubscribe()); this.subs = [];
    this.started = false;
    this.incoming.set([]); this.ready.set([]); this.loading.set(true);
  }
}
