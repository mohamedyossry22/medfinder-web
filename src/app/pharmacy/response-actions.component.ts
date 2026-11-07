import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PharmacyStore } from './pharmacy.store';

/** الأزرار الأربعة: متوفر / متوفر جزئي / غير متوفر + (تفاصيل عبر ng-content) */
@Component({
  selector: 'app-response-actions',
  standalone: true,
  imports: [FormsModule],
  template: `
  <div class="actions">
    <button class="btn b-ok" [disabled]="busy()" (click)="send('Available')">متوفر</button>
    <button class="btn b-pa" [disabled]="busy() || quantity() < 2" (click)="partial.set(true)">متوفر جزئي</button>
    <button class="btn b-no" [disabled]="busy()" (click)="send('Unavailable')">غير متوفر</button>
    <ng-content></ng-content>
  </div>
  @if (partial()) {
    <div class="row wrap" style="margin-top:10px">
      <label [for]="'q' + targetId()" class="muted">الكمية المتاحة (من {{ quantity() }})</label>
      <input [id]="'q' + targetId()" type="number" min="1" [attr.max]="quantity() - 1" [(ngModel)]="qty" style="width:90px">
      <button class="btn btn-primary" [disabled]="busy()" (click)="send('Partial')">تأكيد</button>
      <button class="btn btn-ghost" (click)="partial.set(false)">إلغاء</button>
    </div>
  }
  @if (error()) { <div class="err" style="margin-top:8px" role="alert">{{ error() }}</div> }`
})
export class ResponseActionsComponent {
  private store = inject(PharmacyStore);
  targetId = input.required<string>();
  quantity = input.required<number>();
  done = output<void>();

  busy = signal(false); partial = signal(false); error = signal('');
  qty = 1;

  async send(status: 'Available' | 'Partial' | 'Unavailable') {
    if (status === 'Partial' && (!Number.isInteger(this.qty) || this.qty < 1 || this.qty >= this.quantity())) {
      this.error.set('الكمية لازم تكون أكبر من صفر وأقل من المطلوبة'); return;
    }
    this.busy.set(true); this.error.set('');
    try {
      await this.store.respond(this.targetId(), status, status === 'Partial' ? this.qty : undefined);
      this.done.emit();
    } catch (e: any) {
      const c = e?.error?.error;
      this.error.set(c === 'expired' ? 'الطلب انتهى وقته' : c === 'locked' ? 'مينفعش تعدّل الرد دلوقتي' : 'حصل خطأ، حاول تاني');
      if (c === 'expired') this.store.drop(this.targetId());
    } finally { this.busy.set(false); }
  }
}
