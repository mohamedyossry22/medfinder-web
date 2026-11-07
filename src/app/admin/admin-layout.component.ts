import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="shell">
    <aside class="side">
      <div class="brand">MedFinder <small class="muted" style="font-size:12px">Admin</small></div>
      <a class="nav" routerLink="dashboard" routerLinkActive="on">الإحصائيات</a>
      <a class="nav" routerLink="pharmacies" routerLinkActive="on">طلبات الصيدليات</a>
      <div class="grow"></div>
      <div class="muted" style="padding:0 14px;font-size:13px">{{ auth.session()?.fullName }}</div>
      <button class="nav" (click)="auth.logout()">تسجيل الخروج</button>
    </aside>
    <main class="main"><router-outlet></router-outlet></main>
  </div>`
})
export class AdminLayoutComponent { auth = inject(AuthService); }
