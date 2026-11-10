import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { HistoryItem } from '../core/models';

type Preset = 'all' | 'week' | 'month' | 'year' | 'custom';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule],
  template: `
  <p class="muted" style="margin:0">كل الطلبات اللي سلّمتها من أول يوم اشتركت فيه. فلتر بالفترة أو بتاريخ تحدده.</p>

  <div class="card">
    <div class="tabs" role="tablist">
      @for (t of presets; track t.v) {
        <button class="tab" role="tab" [class.on]="preset() === t.v" (click)="setPreset(t.v)">{{ t.l }}</button>
      }
    </div>
    <form class="row wrap" (ngSubmit)="applyCustom()">
      <div class="field"><label for="from">من تاريخ</label><input id="from" name="from" type="date" [(ngModel)]="from"></div>
      <div class="field"><label for="to">إلى تاريخ</label><input id="to" name="to" type="date" [(ngModel)]="to"></div>
      <button class="btn btn-primary" type="submit" style="align-self:flex-end">تطبيق</button>
    </form>
    @if (formError()) { <div class="err" role="alert">{{ formError() }}</div> }
  </div>

  <section class="stats">
    <div class="card stat"><span class="muted">عدد الطلبات المسلّمة</span><b>{{ total() }}</b></div>
    <div class="card stat"><span class="muted">إجمالي العلب المسلّمة</span><b>{{ totalQty() }}</b></div>
  </section>

  @if (error()) { <div class="err" role="alert">تعذر تحميل السجل</div> }
  <div class="card table-wrap">
    <table>
      <thead><tr><th>الدواء</th><th>الكمية</th><th>تاريخ التسليم</th><th>تأكيد العميل</th></tr></thead>
      <tbody>
        @for (r of rows(); track r.targetId) {
          <tr>
            <td><div dir="ltr" style="font-weight:700;text-align:right">{{ r.drugNameEn }}</div><div class="muted" style="font-size:12px">{{ r.drugNameAr }}</div></td>
            <td>{{ r.quantity }}</td>
            <td>{{ when(r.deliveredAt) }}</td>
            <td>@if (r.confirmedByUser) { <span class="st st-Approved">أكّد الاستلام</span> } @else { <span class="st st-Pending">بانتظار التأكيد</span> }</td>
          </tr>
        } @empty { <tr><td colspan="4" class="empty">{{ loading() ? 'جاري التحميل...' : 'مفيش طلبات مسلّمة في الفترة دي' }}</td></tr> }
      </tbody>
    </table>
  </div>

  @if (pages() > 1) {
    <div class="row" style="justify-content:center">
      <button class="btn btn-ghost" [disabled]="page() <= 1" (click)="go(page() - 1)">السابق</button>
      <span class="muted">{{ page() }} / {{ pages() }}</span>
      <button class="btn btn-ghost" [disabled]="page() >= pages()" (click)="go(page() + 1)">التالي</button>
    </div>
  }`
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);
  presets: { v: Preset; l: string }[] = [
    { v: 'week', l: 'آخر أسبوع' }, { v: 'month', l: 'آخر شهر' }, { v: 'year', l: 'آخر سنة' }, { v: 'all', l: 'من البداية' }];
  preset = signal<Preset>('month');
  from = ''; to = '';
  rows = signal<HistoryItem[]>([]);
  total = signal(0); totalQty = signal(0);
  page = signal(1); pages = signal(1);
  loading = signal(true); error = signal(false); formError = signal('');

  ngOnInit() { this.setPreset('month'); }

  setPreset(p: Preset) {
    this.preset.set(p); this.formError.set('');
    if (p === 'all') { this.from = ''; this.to = ''; }
    else {
      const days = p === 'week' ? 7 : p === 'month' ? 30 : 365;
      const f = new Date(); f.setDate(f.getDate() - days);
      this.from = iso(f); this.to = iso(new Date());
    }
    this.page.set(1); this.load();
  }

  applyCustom() {
    if (!this.from && !this.to) { this.formError.set('اختار تاريخ البداية أو النهاية'); return; }
    if (this.from && this.to && this.from > this.to) { this.formError.set('تاريخ البداية بعد تاريخ النهاية'); return; }
    this.formError.set(''); this.preset.set('custom'); this.page.set(1); this.load();
  }

  go(p: number) { this.page.set(p); this.load(); }
  when(i: string) { return new Date(i).toLocaleString('ar-EG'); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.api.history({ from: this.from || undefined, to: this.to || undefined, page: this.page() }).subscribe({
      next: r => {
        this.rows.set(r.items); this.total.set(r.total); this.totalQty.set(r.totalQuantity);
        this.pages.set(Math.max(1, Math.ceil(r.total / r.pageSize))); this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
}
