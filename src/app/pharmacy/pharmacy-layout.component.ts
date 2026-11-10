import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";
import { RealtimeService } from "../core/realtime.service";
import { PharmacyMe } from "../core/models";
import { statusAr } from "../core/fmt";
import { PushService } from "../core/push.service";
import { PharmacyStore } from "./pharmacy.store";
import { LogoComponent } from "../admin/logo.component";

@Component({
  selector: "app-pharmacy-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: ` <div class="shell">
    <aside class="side">
      <div class="brand"><app-logo [size]="36"></app-logo></div>
      @if (approved()) {
        <a class="nav" routerLink="incoming" routerLinkActive="on"
          ><span>الطلبات الواردة</span>
          @if (store.activeIncoming().length) {
            <span class="badge">{{ store.activeIncoming().length }}</span>
          }
        </a>
        <a class="nav" routerLink="ready" routerLinkActive="on"
          ><span>جاهزة للتسليم</span>
          @if (store.activeReady().length) {
            <span
              class="badge"
              style="background:var(--ok-soft);color:var(--ok)"
              >{{ store.activeReady().length }}</span
            >
          }
        </a>
        <a class="nav" routerLink="history" routerLinkActive="on"
          >الطلبات المسلّمة</a
        >
        <a class="nav" routerLink="ads" routerLinkActive="on">إعلاناتي</a>
        <a class="nav" routerLink="profile" routerLinkActive="on"
          >بيانات الصيدلية</a
        >
      }
      <div class="grow"></div>
      <button class="nav" (click)="logout()">تسجيل الخروج</button>
    </aside>

    <main class="main">
      <header class="top">
        <div>
          <h1>{{ title() }}</h1>
          @if (me(); as m) {
            <div class="muted">
              {{ m.name }} · {{ m.pharmacistName }} · {{ m.governorate }}
            </div>
          }
        </div>
        @if (approved()) {
          <div class="row wrap">
            @if (pushMsg()) {
              <span class="muted" style="font-size:13px">{{ pushMsg() }}</span>
            }
            @if (canEnablePush()) {
              <button class="btn btn-ghost" (click)="enablePush()">
                🔔 فعّل الإشعارات
              </button>
            }
            <div class="live" [class.on]="rt.connected()">
              <i></i
              >{{ rt.connected() ? "متصل Live" : "جاري إعادة الاتصال..." }}
            </div>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="empty">جاري التحميل...</div>
      } @else if (approved()) {
        <router-outlet></router-outlet>
      } @else if (me()) {
        <div class="card" style="max-width:560px">
          <h2>حالة الحساب: {{ label(me()!.status) }}</h2>

          @switch (me()!.status) {
            @case ("Pending") {
              <p class="muted">
                جاري مراجعة بيانات صيدليتك ورقم الرخصة. هيوصلك رسالة بمجرد
                الاعتماد، وبعدها تقدر تستقبل الطلبات.
              </p>
            }
            @case ("Rejected") {
              <p class="muted">
                تم رفض الطلب. السبب: {{ me()!.reason || "غير محدد" }}
              </p>
            }
            @default {
              <p class="muted">
                الحساب موقوف حاليًا{{
                  me()!.reason ? ": " + me()!.reason : ""
                }}. تواصل مع الدعم.
              </p>
            }
          }
        </div>
      } @else {
        <div class="err">تعذر تحميل بيانات الحساب</div>
      }
    </main>
  </div>`,
})
export class PharmacyLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  rt = inject(RealtimeService);
  store = inject(PharmacyStore);
  push = inject(PushService);
  pushMsg = signal("");
  private api = inject(ApiService);

  me = signal<PharmacyMe | null>(null);
  loading = signal(true);
  approved = signal(false);
  label = statusAr;
  title = () => (this.approved() ? "لوحة الصيدلية" : "حساب الصيدلية");
  canEnablePush = () =>
    !this.push.active() &&
    "Notification" in window &&
    Notification.permission !== "denied";

  ngOnInit() {
    this.api.me().subscribe({
      next: async (m) => {
        this.me.set(m);
        this.auth.setPharmacyStatus(m.status);
        const ok = m.status === "Approved";
        this.approved.set(ok);
        this.loading.set(false);
        if (ok) {
          await this.rt.start();
          await this.store.init();
          this.push.resume();
        }
      },
      error: () => this.loading.set(false),
    });
  }

  async enablePush() {
    const r = await this.push.enable();
    this.pushMsg.set(
      (
        {
          ok: "تم تفعيل الإشعارات ✓",
          denied: "الإشعارات محظورة من إعدادات المتصفح",
          unsupported: "المتصفح لا يدعم الإشعارات",
          not_configured: "إعدادات Firebase لسه ما اتضبطتش",
          error: "تعذر تفعيل الإشعارات",
        } as Record<string, string>
      )[r],
    );
  }

  async logout() {
    await this.push.unregister();
    this.auth.logout();
  }

  ngOnDestroy() {
    this.store.stop();
    this.rt.stop();
  }
}
