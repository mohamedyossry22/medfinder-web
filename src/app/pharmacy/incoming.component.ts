import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PharmacyStore } from './pharmacy.store';
import { ResponseActionsComponent } from './response-actions.component';
import { minutesLeft, remainingFrac, timeAgo } from '../core/fmt';

@Component({
  selector: 'app-incoming',
  standalone: true,
  imports: [RouterLink, ResponseActionsComponent],
  template: `
  @if (store.loading()) { <div class="empty">جاري التحميل...</div> }
  @else if (store.activeIncoming().length === 0) {
    <div class="empty">
      <h3>مفيش طلبات دلوقتي</h3>
      <p>أول ما حد يدور على دواء في نطاقك هيظهر هنا فورًا، من غير ما تعمل Refresh.</p>
    </div>
  } @else {
    <div class="grid">
      @for (r of store.activeIncoming(); track r.targetId) {
        <article class="card" [class.fresh]="store.fresh().has(r.targetId)">
          <div class="row between" style="align-items:flex-start">
            <div>
              @if (store.fresh().has(r.targetId)) { <span class="badge">جديد</span> }
              <div dir="ltr" style="font-weight:700;font-size:16px;text-align:right">{{ r.drugNameEn }}</div>
              <div class="muted">{{ r.drugNameAr }}</div>
              @if (r.activeIngredient) { <div class="muted" dir="ltr" style="font-size:12px;text-align:right;word-break: break-word;">{{ r.activeIngredient }}</div> }
            </div>
            <svg width="48" height="48" viewBox="0 0 48 48" role="img" [attr.aria-label]="'متبقي ' + left(r.expiresAt) + ' دقيقة للرد'">
              <circle cx="24" cy="24" r="19" fill="none" stroke="var(--primary-soft)" stroke-width="5"/>
              <circle cx="24" cy="24" r="19" fill="none" stroke="var(--primary)" stroke-width="5" stroke-linecap="round"
                      stroke-dasharray="119.4" [attr.stroke-dashoffset]="119.4 * (1 - frac(r.expiresAt))" transform="rotate(-90 24 24)"/>
              <text x="24" y="29" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">{{ left(r.expiresAt) }}د</text>
            </svg>
          </div>
          <div class="row wrap">
            <span class="tag">{{ r.quantity }} علبة</span>
            <span class="tag">{{ r.distanceKm }} كم</span>
            <span class="tag">{{ ago(r.createdAt) }}</span>
          </div>
          <app-response-actions [targetId]="r.targetId" [quantity]="r.quantity">
            <a class="btn b-in" [routerLink]="['/pharmacy/requests', r.targetId]">تفاصيل</a>
          </app-response-actions>
        </article>
      }
    </div>
  }`
})
export class IncomingComponent {
  store = inject(PharmacyStore);
  frac = (e: string) => remainingFrac(e, this.store.now());
  left = (e: string) => minutesLeft(e, this.store.now());
  ago = timeAgo;
}
