import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AdminPharmacyRow, PharmacyStatus } from '../core/models';
import { statusAr } from '../core/fmt';

@Component({
  selector: 'app-pharmacies',
  standalone: true,
  imports: [FormsModule],
  template: `
  <header class="top"><h1>طلبات انضمام الصيدليات</h1></header>

  <div class="row between wrap">
    <div class="tabs" role="tablist">
      @for (t of tabs; track t.v) {
        <button class="tab" role="tab" [class.on]="status() === t.v" (click)="setStatus(t.v)">{{ t.l }}</button>
      }
    </div>
    <form class="row" (ngSubmit)="search()">
      <input name="q" [(ngModel)]="q" placeholder="بحث بالاسم أو رقم الرخصة" style="width:260px">
      <button class="btn btn-primary" type="submit">بحث</button>
    </form>
  </div>

  @if (error()) { <div class="err" role="alert">تعذر تحميل القائمة</div> }
  <div class="card table-wrap">
    <table>
      <thead><tr><th>الصيدلية</th><th>الصيدلي</th><th>رقم الرخصة</th><th>المحافظة</th><th>الحالة</th><th>تاريخ الطلب</th></tr></thead>
      <tbody>
        @for (p of rows(); track p.id) {
          <tr class="click" tabindex="0" (click)="open(p.id)" (keydown.enter)="open(p.id)">
            <td><b>{{ p.name }}</b></td><td>{{ p.pharmacistName }}</td><td dir="ltr">{{ p.licenseNumber }}</td>
            <td>{{ p.governorate }}</td>
            <td><span class="st" [class]="'st st-' + p.status">{{ label(p.status) }}</span></td>
            <td>{{ p.createdAt.slice(0, 10) }}</td>
          </tr>
        } @empty { <tr><td colspan="6" class="empty">{{ loading() ? 'جاري التحميل...' : 'لا توجد نتائج' }}</td></tr> }
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
export class PharmaciesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  tabs: { v: PharmacyStatus | ''; l: string }[] = [
    { v: 'Pending', l: 'قيد المراجعة' }, { v: 'Approved', l: 'معتمدة' },
    { v: 'Rejected', l: 'مرفوضة' }, { v: 'Suspended', l: 'موقوفة' }, { v: '', l: 'الكل' }];
  status = signal<PharmacyStatus | ''>('Pending');
  rows = signal<AdminPharmacyRow[]>([]);
  page = signal(1); pages = signal(1);
  loading = signal(true); error = signal(false);
  q = '';
  label = statusAr;

  ngOnInit() { this.load(); }
  setStatus(s: PharmacyStatus | '') { this.status.set(s); this.page.set(1); this.load(); }
  search() { this.page.set(1); this.load(); }
  go(p: number) { this.page.set(p); this.load(); }
  open(id: string) { this.router.navigate(['/admin/pharmacies', id]); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.api.adminPharmacies({ status: this.status(), q: this.q.trim(), page: this.page() }).subscribe({
      next: r => { this.rows.set(r.items); this.pages.set(Math.max(1, Math.ceil(r.total / r.pageSize))); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
}
