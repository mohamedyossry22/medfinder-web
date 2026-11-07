import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Stats } from '../core/models';
import { duration, statusAr } from '../core/fmt';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
  <header class="top"><h1>الإحصائيات</h1><button class="btn btn-ghost" (click)="load()">تحديث</button></header>
  @if (error()) { <div class="err" role="alert">تعذر تحميل الإحصائيات</div> }
  @if (s(); as st) {
    <section class="stats">
      <div class="card stat"><span class="muted">المستخدمين</span><b>{{ st.users }}</b></div>
      <div class="card stat"><span class="muted">صيدليات معتمدة</span><b>{{ st.pharmacies['Approved'] || 0 }}</b></div>
      <a class="card stat" routerLink="/admin/pharmacies" style="border:2px solid var(--accent)">
        <span class="muted">طلبات انضمام معلّقة</span><b>{{ st.pharmacies['Pending'] || 0 }}</b></a>
      <div class="card stat"><span class="muted">طلبات اليوم</span><b>{{ st.requests.today }}</b></div>
      <div class="card stat"><span class="muted">آخر 7 أيام</span><b>{{ st.requests.week }}</b></div>
      <div class="card stat"><span class="muted">آخر 30 يوم</span><b>{{ st.requests.month }}</b></div>
      <div class="card stat"><span class="muted">نسبة الطلبات اللي لقت "متوفر" (30 يوم)</span><b>{{ st.availabilityRate30d }}%</b></div>
      <div class="card stat"><span class="muted">متوسط زمن الرد</span><b style="font-size:24px">{{ dur(st.avgResponseSeconds30d) }}</b></div>
    </section>

    <section class="grid">
      <div class="card">
        <h3>الأدوية الأكثر طلبًا</h3>
        @for (x of st.topRequested; track $index) {
          <div><div class="row between"><span dir="ltr">{{ x.drug.nameEn }}</span><b>{{ x.count }}</b></div>
            <div class="bar"><span [style.width.%]="pct(x.count, st.topRequested)"></span></div></div>
        } @empty { <div class="muted">لا توجد بيانات بعد</div> }
      </div>
      <div class="card">
        <h3>نقص حقيقي: مطلوبة ومحدش رد</h3>
        <span class="muted" style="font-size:13px">طلبات انتهى وقتها ومفيش صيدلية قالت متوفر</span>
        @for (x of st.unansweredDemand; track $index) {
          <div><div class="row between"><span dir="ltr">{{ x.drug.nameEn }}</span><b>{{ x.count }}</b></div>
            <div class="bar"><span style="background:var(--accent)" [style.width.%]="pct(x.count, st.unansweredDemand)"></span></div></div>
        } @empty { <div class="muted">لا توجد بيانات بعد</div> }
      </div>
      <div class="card">
        <h3>الطلبات حسب المحافظة</h3>
        @for (x of st.byGovernorate; track x.governorate) {
          <div><div class="row between"><span>{{ x.governorate }}</span><b>{{ x.requests }}</b></div>
            <div class="bar"><span [style.width.%]="gpct(x.requests, st)"></span></div></div>
        } @empty { <div class="muted">لا توجد بيانات بعد</div> }
      </div>
      <div class="card">
        <h3>الصيدليات حسب الحالة</h3>
        @for (k of statuses; track k) {
          <div class="row between"><span class="st" [class]="'st st-' + k">{{ label(k) }}</span><b>{{ st.pharmacies[k] || 0 }}</b></div>
        }
      </div>
    </section>
  }`
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  s = signal<Stats | null>(null);
  error = signal(false);
  statuses = ['Approved', 'Pending', 'Rejected', 'Suspended'];
  label = statusAr; dur = duration;

  ngOnInit() { this.load(); }
  load() {
    this.error.set(false);
    this.api.stats().subscribe({ next: r => this.s.set(r), error: () => this.error.set(true) });
  }
  pct(n: number, list: { count: number }[]) { const m = Math.max(1, ...list.map(x => x.count)); return Math.round(n / m * 100); }
  gpct(n: number, st: Stats) { const m = Math.max(1, ...st.byGovernorate.map(x => x.requests)); return Math.round(n / m * 100); }
}
