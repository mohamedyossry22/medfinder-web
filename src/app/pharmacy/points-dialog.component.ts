import { Component, Injectable, inject, signal } from '@angular/core';
import { RespondResult } from '../core/models';
import { pointsAr } from '../core/fmt';
import { ModalComponent } from './modal.component';

/** بيعرض "مبروك" لما الصيدلية تكسب نقاط من الرد على طلب */
@Injectable({ providedIn: 'root' })
export class PointsDialogService {
  readonly award = signal<RespondResult | null>(null);
  show(r: RespondResult) { this.award.set(r); }
  close() { this.award.set(null); }
}

@Component({
  selector: 'app-points-dialog',
  standalone: true,
  imports: [ModalComponent],
  template: `
  @if (svc.award(); as a) {
    <app-modal title="مبروك! 🎉" (closed)="svc.close()">
      <p style="margin:0;font-size:18px;font-weight:700">تم إضافة {{ pts(a.pointsAwarded) }} إلى رصيدك</p>
      <p class="muted" style="margin:0">{{ tier(a.pointsAwarded) }}</p>
      @if (a.pointsBalance !== null) { <p style="margin:0">رصيدك الحالي: <b>{{ pts(a.pointsBalance) }}</b></p> }
      <p class="muted" style="margin:0">استمر بالرد بسرعة علشان تستفيد بالنقاط في الإعلانات.</p>
      <button class="btn btn-primary" type="button" (click)="svc.close()">تمام</button>
    </app-modal>
  }`
})
export class PointsDialogComponent {
  svc = inject(PointsDialogService);
  pts = pointsAr;
  tier(n: number) {
    return n >= 3 ? 'ردّيت في أول 5 دقايق' : n === 2 ? 'ردّيت خلال 10 دقايق' : 'ردّيت بعد 10 دقايق';
  }
}
