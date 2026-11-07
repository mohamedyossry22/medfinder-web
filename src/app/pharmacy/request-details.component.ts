import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RequestDetail } from '../core/models';
import { statusAr, timeAgo } from '../core/fmt';
import { ResponseActionsComponent } from './response-actions.component';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [RouterLink, ResponseActionsComponent],
  template: `
  <a routerLink="/pharmacy/incoming" class="muted">← رجوع للطلبات</a>
  @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
  @if (d(); as r) {
    <article class="card" style="max-width:640px">
      <div>
        <div dir="ltr" style="font-weight:700;font-size:20px;text-align:right">{{ r.drugNameEn }}</div>
        <div class="muted">{{ r.drugNameAr }}</div>
      </div>
      <div class="row wrap">
        <span class="tag">الكمية المطلوبة: {{ r.quantity }}</span>
        <span class="tag">{{ r.distanceKm }} كم</span>
        <span class="tag">{{ ago(r.createdAt) }}</span>
        <span class="st" [class]="'st st-' + r.status">{{ label(r.status) }}</span>
      </div>
      <table>
        <tr><th>المادة الفعالة</th><td dir="ltr">{{ r.activeIngredient || '—' }}</td></tr>
        <tr><th>الشركة المصنعة</th><td dir="ltr">{{ r.manufacturer || '—' }}</td></tr>
        <tr><th>طريقة الاستخدام</th><td dir="ltr">{{ r.route || '—' }}</td></tr>
        @if (r.availableQty) { <tr><th>الكمية اللي قلت إنها متاحة</th><td>{{ r.availableQty }}</td></tr> }
      </table>
      @if (r.status === 'Pending') {
        <app-response-actions [targetId]="r.id" [quantity]="r.quantity" (done)="back()"></app-response-actions>
      }
    </article>
  }`
})
export class RequestDetailsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  id = input.required<string>();     // من الـ route param
  d = signal<RequestDetail | null>(null);
  error = signal('');
  label = statusAr; ago = timeAgo;

  ngOnInit() {
    this.api.request(this.id()).subscribe({
      next: r => this.d.set(r),
      error: () => this.error.set('الطلب غير موجود أو انتهى')
    });
  }
  back() { this.router.navigateByUrl('/pharmacy/ready'); }
}
