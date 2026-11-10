import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { API } from '../core/config';
import { AdminAd, AdStatus } from '../core/models';
import { statusAr } from '../core/fmt';

@Component({
  selector: 'app-admin-ads',
  standalone: true,
  imports: [FormsModule],
  template: `
  <header class="top"><h1>مراجعة الإعلانات</h1></header>
  <p class="muted" style="margin:0">راجع الإعلان قبل اعتماده، خصوصًا ادعاءات علاجية أو أسعار أو أدوية مقيّدة.</p>

  <div class="tabs" role="tablist">
    @for (t of tabs; track t.v) { <button class="tab" role="tab" [class.on]="status() === t.v" (click)="setStatus(t.v)">{{ t.l }}</button> }
  </div>
  @if (error()) { <div class="err" role="alert">حصل خطأ، حاول تاني</div> }

  <div class="grid">
    @for (a of ads(); track a.id) {
      <article class="card">
        <img [src]="url(a.imagePath)" [alt]="a.title" style="width:100%;height:170px;object-fit:cover;border-radius:14px">
        <div class="row between"><b>{{ a.title }}</b><span class="st" [class]="'st st-' + a.status">{{ label(a.status) }}</span></div>
        <div class="muted" style="font-size:13px">{{ a.pharmacyName }} · {{ a.startDate.slice(0, 10) }} ← {{ a.endDate.slice(0, 10) }}</div>
        @if (a.linkUrl) { <a dir="ltr" target="_blank" rel="noopener" [href]="a.linkUrl" style="font-size:12px;word-break:break-all">{{ a.linkUrl }}</a> }

        @if (a.status !== 'Approved') {
          <button class="btn btn-primary" [disabled]="busy() === a.id" (click)="act(a, 'approve')">اعتماد</button>
        }
        @if (a.status !== 'Rejected') {
          @if (rejecting() === a.id) {
            <div class="field"><label [for]="'rr' + a.id">سبب الرفض</label><input [id]="'rr' + a.id" [name]="'rr' + a.id" [(ngModel)]="reason"></div>
            <div class="row">
              <button class="btn btn-danger" [disabled]="!reason.trim() || busy() === a.id" (click)="act(a, 'reject', reason)">تأكيد الرفض</button>
              <button class="btn btn-ghost" (click)="rejecting.set(null)">إلغاء</button>
            </div>
          } @else { <button class="btn btn-ghost" (click)="rejecting.set(a.id)">رفض</button> }
        }
      </article>
    } @empty { <div class="empty">{{ loading() ? 'جاري التحميل...' : 'لا توجد إعلانات' }}</div> }
  </div>`
})
export class AdminAdsComponent implements OnInit {
  private api = inject(ApiService);
  tabs: { v: AdStatus | ''; l: string }[] = [
    { v: 'Pending', l: 'قيد المراجعة' }, { v: 'Approved', l: 'معتمدة' }, { v: 'Rejected', l: 'مرفوضة' }, { v: '', l: 'الكل' }];
  status = signal<AdStatus | ''>('Pending');
  ads = signal<AdminAd[]>([]);
  loading = signal(true); error = signal(false);
  busy = signal<string | null>(null); rejecting = signal<string | null>(null);
  reason = '';
  label = statusAr;
  url = (p: string) => API + p;

  ngOnInit() { this.load(); }
  setStatus(s: AdStatus | '') { this.status.set(s); this.load(); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.api.adminAds(this.status()).subscribe({
      next: r => { this.ads.set(r); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  act(a: AdminAd, action: 'approve' | 'reject', reason?: string) {
    this.busy.set(a.id); this.error.set(false);
    this.api.adAction(a.id, action, reason).subscribe({
      next: () => { this.busy.set(null); this.rejecting.set(null); this.reason = ''; this.load(); },
      error: () => { this.busy.set(null); this.error.set(true); }
    });
  }
}