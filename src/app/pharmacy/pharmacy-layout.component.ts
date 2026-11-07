import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { RealtimeService } from '../core/realtime.service';
import { PharmacyMe } from '../core/models';
import { statusAr } from '../core/fmt';
import { PharmacyStore } from './pharmacy.store';

@Component({
  selector: 'app-pharmacy-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="shell">
    <aside class="side">
      <div class="brand">MedFinder</div>
      @if (approved()) {
        <a class="nav" routerLink="incoming" routerLinkActive="on"><span>الطلبات الواردة</span>
          @if (store.activeIncoming().length) { <span class="badge">{{ store.activeIncoming().length }}</span> }</a>
        <a class="nav" routerLink="ready" routerLinkActive="on"><span>جاهزة للتسليم</span>
          @if (store.activeReady().length) { <span class="badge" style="background:var(--ok-soft);color:var(--ok)">{{ store.activeReady().length }}</span> }</a>
      }
      <div class="grow"></div>
      <button class="nav" (click)="auth.logout()">تسجيل الخروج</button>
    </aside>

    <main class="main">
      <header class="top">
        <div>
          <h1>{{ title() }}</h1>
          @if (me(); as m) { <div class="muted">{{ m.name }} · {{ m.pharmacistName }} · {{ m.governorate }}</div> }
        </div>
        @if (approved()) {
          <div class="row wrap">
            @if (canAskNotif()) { <button class="btn btn-ghost" (click)="askNotif()">🔔 فعّل تنبيهات المتصفح</button> }
            <div class="live" [class.on]="rt.connected()"><i></i>{{ rt.connected() ? 'متصل Live' : 'جاري إعادة الاتصال...' }}</div>
          </div>
        }
      </header>

      @if (loading()) { <div class="empty">جاري التحميل...</div> }
      @else if (approved()) { <router-outlet></router-outlet> }
      @else {
        @if (me(); as m) {
          <div class="card" style="max-width:560px">
            <h2>حالة الحساب: {{ label(m.status) }}</h2>
            @switch (m.status) {
              @case ('Pending') { <p class="muted">جاري مراجعة بيانات صيدليتك ورقم الرخصة. هيوصلك رسالة بمجرد الاعتماد، وبعدها تقدر تستقبل الطلبات.</p> }
              @case ('Rejected') { <p class="muted">تم رفض الطلب. السبب: {{ m.reason || 'غير محدد' }}</p> }
              @default { <p class="muted">الحساب موقوف حاليًا{{ m.reason ? ': ' + m.reason : '' }}. تواصل مع الدعم.</p> }
            }
          </div>
        } @else { <div class="err">تعذر تحميل بيانات الحساب</div> }
      }
    </main>
  </div>`
})
export class PharmacyLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  rt = inject(RealtimeService);
  store = inject(PharmacyStore);
  private api = inject(ApiService);

  me = signal<PharmacyMe | null>(null);
  loading = signal(true);
  approved = signal(false);
  label = statusAr;
  title = () => this.approved() ? 'لوحة الصيدلية' : 'حساب الصيدلية';
  canAskNotif = () => 'Notification' in window && Notification.permission === 'default';

  ngOnInit() {
    this.api.me().subscribe({
      next: async m => {
        this.me.set(m);
        this.auth.setPharmacyStatus(m.status);
        const ok = m.status === 'Approved';
        this.approved.set(ok);
        this.loading.set(false);
        if (ok) { await this.rt.start(); await this.store.init(); }
      },
      error: () => this.loading.set(false)
    });
  }

  askNotif() { Notification.requestPermission(); }

  ngOnDestroy() { this.store.stop(); this.rt.stop(); }
}
