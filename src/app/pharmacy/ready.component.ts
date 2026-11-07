import { Component, inject, signal } from '@angular/core';
import { PharmacyStore } from './pharmacy.store';
import { hoursLeft, statusAr } from '../core/fmt';

@Component({
  selector: 'app-ready',
  standalone: true,
  template: `
  <p class="muted" style="margin:0">الطلبات اللي قلت إنها متوفرة. لما العميل ييجي ياخد الدواء اضغط "تم التسليم". الطلب بيختفي بعد 6 ساعات من وقت إنشائه.</p>
  @if (store.loading()) { <div class="empty">جاري التحميل...</div> }
  @else if (store.activeReady().length === 0) { <div class="empty">مفيش طلبات جاهزة للتسليم دلوقتي</div> }
  @else {
    <div class="grid">
      @for (r of store.activeReady(); track r.targetId) {
        <article class="card">
          <div>
            <div dir="ltr" style="font-weight:700;font-size:16px;text-align:right">{{ r.drugNameEn }}</div>
            <div class="muted">{{ r.drugNameAr }}</div>
          </div>
          <div class="row wrap">
            <span class="st" [class]="'st st-' + r.status">{{ label(r.status) }}</span>
            <span class="tag">{{ r.status === 'Partial' ? r.availableQty + ' من ' + r.quantity : r.quantity }} علبة</span>
            <span class="tag">يختفي بعد {{ left(r.expiresAt) }} ساعة</span>
          </div>
          @if (error() === r.targetId) { <div class="err" role="alert">حصل خطأ، حاول تاني</div> }
          <button class="btn btn-primary" [disabled]="busy() === r.targetId" (click)="deliver(r.targetId)">تم التسليم</button>
        </article>
      }
    </div>
  }`
})
export class ReadyComponent {
  store = inject(PharmacyStore);
  busy = signal<string | null>(null);
  error = signal<string | null>(null);
  label = statusAr;
  left = (e: string) => hoursLeft(e, this.store.now());

  async deliver(id: string) {
    if (!confirm('تأكيد تسليم الدواء للعميل؟')) return;
    this.busy.set(id); this.error.set(null);
    try { await this.store.deliver(id); } catch { this.error.set(id); } finally { this.busy.set(null); }
  }
}
