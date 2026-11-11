import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { RealtimeService } from '../core/realtime.service';
import { beep } from '../core/sound';
import { ComplaintsStore } from './complaints.store';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
  <div class="shell">
    <aside class="side">
      <div class="brand"><app-logo [size]="36" tagline="لوحة الإدارة"></app-logo></div>
      <a class="nav" routerLink="dashboard" routerLinkActive="on">الإحصائيات</a>
      <a class="nav" routerLink="pharmacies" routerLinkActive="on">طلبات الصيدليات</a>
      <a class="nav" routerLink="users" routerLinkActive="on">المستخدمين</a>
      <a class="nav" routerLink="complaints" routerLinkActive="on">الشكاوى
        @if (store.newCount() > 0) { <span class="badge" aria-label="شكاوى جديدة">{{ store.newCount() }}</span> }
      </a>
      <a class="nav" routerLink="ads" routerLinkActive="on">الإعلانات</a>
      <a class="nav" routerLink="barcodes" routerLinkActive="on">الباركودات</a>
      <div class="grow"></div>
      <div class="muted" style="padding:0 14px;font-size:13px">{{ auth.session()?.fullName }}</div>
      <button class="nav" (click)="auth.logout()">تسجيل الخروج</button>
    </aside>
    <main class="main"><router-outlet></router-outlet></main>
  </div>`
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  store = inject(ComplaintsStore);
  private rt = inject(RealtimeService);
  private subs = new Subscription();

  ngOnInit() {
    this.store.refresh();
    // شكوى جديدة لايف: البادج + نغمة. وبعد أي إعادة اتصال نعيد العدّ لأن ممكن نكون فوّتنا شكاوى
    this.subs.add(this.rt.newComplaint$.subscribe(() => { this.store.refresh(); beep(); }));
    this.subs.add(this.rt.reconnected$.subscribe(() => this.store.refresh()));
    this.rt.start();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.rt.stop();
  }
}
