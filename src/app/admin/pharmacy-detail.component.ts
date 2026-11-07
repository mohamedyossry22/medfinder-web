import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AdminPharmacy } from '../core/models';
import { statusAr } from '../core/fmt';

@Component({
  selector: 'app-pharmacy-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
  <a routerLink="/admin/pharmacies" class="muted">← رجوع للقائمة</a>
  @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
  @if (msg()) { <div class="okmsg" role="status">{{ msg() }}</div> }

  @if (p(); as x) {
    <header class="top">
      <h1>{{ x.name }}</h1>
      <span class="st" [class]="'st st-' + x.status">{{ label(x.status) }}</span>
    </header>

    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(340px,1fr))">
      <section class="card">
        <h3>بيانات الصيدلية</h3>
        <table>
          <tr><th>الصيدلي</th><td>{{ x.pharmacistName }}</td></tr>
          <tr><th>رقم الرخصة</th><td dir="ltr"><b>{{ x.licenseNumber }}</b></td></tr>
          <tr><th>المحافظة</th><td>{{ x.governorate }}</td></tr>
          <tr><th>الهاتف</th><td dir="ltr">{{ x.phone }}</td></tr>
          <tr><th>البريد</th><td dir="ltr">{{ x.email }}</td></tr>
          <tr><th>العنوان</th><td>{{ x.address || '—' }}</td></tr>
          <tr><th>الموقع</th><td dir="ltr">{{ x.lat.toFixed(5) }}, {{ x.lng.toFixed(5) }}</td></tr>
          <tr><th>تاريخ الطلب</th><td>{{ x.createdAt.slice(0, 10) }}</td></tr>
          @if (x.reason) { <tr><th>السبب</th><td>{{ x.reason }}</td></tr> }
        </table>
        <a class="btn btn-ghost" target="_blank" rel="noopener" [href]="mapLink(x)">فتح الموقع على الخريطة</a>
        @if (x.mapsUrl) { <a class="muted" dir="ltr" target="_blank" rel="noopener" [href]="x.mapsUrl" style="font-size:12px;word-break:break-all">{{ x.mapsUrl }}</a> }
      </section>

      <section class="card">
        <h3>صورة الرخصة</h3>
        @if (img(); as src) {
          <img [src]="src" alt="صورة الرخصة" style="width:100%;max-height:320px;object-fit:contain;border-radius:14px;cursor:zoom-in;background:var(--no-soft)" (click)="zoom.set(true)">
          <button class="btn btn-ghost" (click)="zoom.set(true)">تكبير للمراجعة</button>
        } @else { <div class="empty">جاري تحميل الصورة...</div> }
      </section>
    </div>

    <!-- القرار -->
    <section class="card" style="max-width:720px">
      <h3>القرار</h3>
      @if (x.status === 'Pending' || x.status === 'Rejected') {
        <div class="stack" style="gap:8px">
          <span class="muted">راجع قبل الاعتماد:</span>
          @for (c of checklist; track c; let i = $index) {
            <label class="row"><input type="checkbox" style="width:auto" [checked]="checks()[i]" (change)="toggle(i)"> {{ c }}</label>
          }
        </div>
        <div class="row wrap">
          <button class="btn btn-primary" [disabled]="busy() || !allChecked()" (click)="act('approve')">اعتماد الصيدلية</button>
          @if (x.status === 'Pending') { <button class="btn btn-danger" [disabled]="busy()" (click)="rejecting.set(true)">رفض</button> }
        </div>
        @if (rejecting()) {
          <div class="field"><label for="why">سبب الرفض (هيوصل للصيدلية)</label><textarea id="why" rows="3" [(ngModel)]="reason"></textarea></div>
          <div class="row">
            <button class="btn btn-danger" [disabled]="busy() || !reason.trim()" (click)="act('reject', reason)">تأكيد الرفض</button>
            <button class="btn btn-ghost" (click)="rejecting.set(false)">إلغاء</button>
          </div>
        }
      }
      @if (x.status === 'Approved') {
        <div class="field"><label for="sr">سبب الإيقاف (اختياري)</label><input id="sr" [(ngModel)]="reason"></div>
        <button class="btn btn-danger" [disabled]="busy()" (click)="act('suspend', reason)">إيقاف الحساب</button>
      }
      @if (x.status === 'Suspended') { <button class="btn btn-primary" [disabled]="busy()" (click)="act('activate')">إعادة تفعيل الحساب</button> }
    </section>

    @if (zoom() && img(); as src) {
      <div class="overlay" role="dialog" aria-label="صورة الرخصة">
        <div class="bar-top">
          <button class="btn btn-primary" (click)="scale.set(scale() + 0.25)">+ تكبير</button>
          <button class="btn btn-primary" (click)="scale.set(Math.max(0.5, scale() - 0.25))">− تصغير</button>
          <button class="btn btn-ghost" style="color:#fff" (click)="scale.set(1)">100%</button>
          <button class="btn btn-danger" (click)="zoom.set(false)">إغلاق</button>
        </div>
        <div class="view"><img [src]="src" alt="صورة الرخصة" [style.width.%]="scale() * 100" style="max-width:none"></div>
      </div>
    }
  }`
})
export class PharmacyDetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  id = input.required<string>();

  p = signal<AdminPharmacy | null>(null);
  img = signal<string | null>(null);
  error = signal(''); msg = signal(''); busy = signal(false);
  zoom = signal(false); scale = signal(1); rejecting = signal(false);
  reason = '';
  label = statusAr; Math = Math;

  checklist = ['رقم الرخصة واضح ومطابق للمدخل', 'اسم الصيدلي مطابق لما في الرخصة', 'الرخصة سارية (تاريخ الصلاحية)', 'المحافظة والعنوان منطقيين'];
  checks = signal<boolean[]>(this.checklist.map(() => false));
  allChecked = computed(() => this.checks().every(Boolean));
  toggle(i: number) { this.checks.update(c => c.map((v, k) => k === i ? !v : v)); }

  mapLink = (x: AdminPharmacy) => `https://www.google.com/maps?q=${x.lat},${x.lng}`;

  ngOnInit() {
    this.api.adminPharmacy(this.id()).subscribe({
      next: r => { this.p.set(r); this.loadImage(); },
      error: () => this.error.set('الصيدلية غير موجودة')
    });
  }

  private loadImage() {
    this.api.license(this.id()).subscribe({
      next: b => this.img.set(URL.createObjectURL(b)),
      error: () => this.error.set('تعذر تحميل صورة الرخصة')
    });
  }

  act(action: 'approve' | 'reject' | 'suspend' | 'activate', reason?: string) {
    this.busy.set(true); this.error.set(''); this.msg.set('');
    this.api.pharmacyAction(this.id(), action, reason).subscribe({
      next: () => {
        this.busy.set(false); this.rejecting.set(false); this.reason = '';
        this.checks.set(this.checklist.map(() => false));
        this.msg.set('تم تنفيذ القرار وتسجيله في سجل المراجعة');
        this.api.adminPharmacy(this.id()).subscribe(r => this.p.set(r));
      },
      error: e => { this.busy.set(false); this.error.set(e?.error?.error === 'invalid_transition' ? 'الحالة اتغيرت، حدّث الصفحة' : 'حصل خطأ، حاول تاني'); }
    });
  }

  ngOnDestroy() { const s = this.img(); if (s) URL.revokeObjectURL(s); }
}
