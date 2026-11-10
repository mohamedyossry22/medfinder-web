import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { PendingBarcode } from '../core/models';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  template: `
  <header class="top"><h1>الباركودات المعلّقة</h1><button class="btn btn-ghost" (click)="load()">تحديث</button></header>
  <p class="muted" style="margin:0">
    ربطات باركود ↔ دواء جت من المستخدمين والصيدليات. الباركود بيتعتمد أوتوماتيك عند مجموع تصويت 3 (المستخدم 1، الصيدلي 2).
    اللي هنا لسه ما اتعتمدش أو فيه تعارض، فتأكد إن الباركود المطبوع على العلبة فعلًا يخص الدواء ده.
  </p>
  @if (error()) { <div class="err" role="alert">حصل خطأ، حاول تاني</div> }

  <div class="card table-wrap">
    <table>
      <thead><tr><th>الباركود</th><th>الدواء</th><th>التصويت</th><th>المصدر</th><th></th></tr></thead>
      <tbody>
        @for (b of rows(); track b.id) {
          <tr>
            <td dir="ltr"><b>{{ b.code }}</b></td>
            <td><div dir="ltr">{{ b.drugNameEn }}</div><div class="muted" style="font-size:12px">{{ b.drugNameAr }}</div></td>
            <td>{{ b.confirmCount }} / 3</td><td>{{ src(b.source) }}</td>
            <td class="row">
              <button class="btn btn-primary" [disabled]="busy() === b.id" (click)="act(b, 'confirm')">اعتماد</button>
              <button class="btn btn-danger" [disabled]="busy() === b.id" (click)="act(b, 'reject')">رفض</button>
            </td>
          </tr>
        } @empty { <tr><td colspan="5" class="empty">{{ loading() ? 'جاري التحميل...' : 'مفيش باركودات معلّقة' }}</td></tr> }
      </tbody>
    </table>
  </div>`
})
export class BarcodesComponent implements OnInit {
  private api = inject(ApiService);
  rows = signal<PendingBarcode[]>([]);
  loading = signal(true); error = signal(false); busy = signal<number | null>(null);
  src = (s: string) => ({ User: 'مستخدم', Pharmacist: 'صيدلي', Admin: 'أدمن' } as Record<string, string>)[s] ?? s;

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true); this.error.set(false);
    this.api.pendingBarcodes().subscribe({
      next: r => { this.rows.set(r); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
  act(b: PendingBarcode, action: 'confirm' | 'reject') {
    this.busy.set(b.id);
    this.api.barcodeAction(b.id, action).subscribe({
      next: () => { this.busy.set(null); this.rows.update(l => l.filter(x => x.id !== b.id)); },
      error: () => { this.busy.set(null); this.error.set(true); }
    });
  }
}
