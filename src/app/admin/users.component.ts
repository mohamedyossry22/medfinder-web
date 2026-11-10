import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AdminUser } from '../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  template: `
  <header class="top"><h1>المستخدمين</h1>
    <form class="row" (ngSubmit)="search()">
      <input name="q" [(ngModel)]="q" placeholder="بحث بالاسم أو الرقم" style="width:240px">
      <button class="btn btn-primary" type="submit">بحث</button>
    </form>
  </header>
  @if (error()) { <div class="err" role="alert">حصل خطأ، حاول تاني</div> }

  <div class="card table-wrap">
    <table>
      <thead><tr><th>الاسم</th><th>الموبايل</th><th>السن</th><th>انضم</th><th>الحالة</th><th></th></tr></thead>
      <tbody>
        @for (u of rows(); track u.id) {
          <tr>
            <td><b>{{ u.fullName }}</b></td><td dir="ltr">{{ u.phoneNumber }}</td><td>{{ u.age ?? '—' }}</td>
            <td>{{ u.createdAt.slice(0, 10) }}</td>
            <td>@if (u.isBanned) { <span class="st st-Rejected" [title]="u.banReason || ''">محظور</span> } @else { <span class="st st-Approved">نشط</span> }</td>
            <td>
              @if (u.isBanned) { <button class="btn btn-ghost" (click)="unban(u)">رفع الحظر</button> }
              @else { <button class="btn btn-ghost" (click)="banning.set(u.id)">حظر</button> }
            </td>
          </tr>
          @if (banning() === u.id) {
            <tr><td colspan="6">
              <div class="row wrap">
                <input [name]="'r' + u.id" [(ngModel)]="reason" placeholder="سبب الحظر (اختياري)" style="max-width:340px">
                <button class="btn btn-danger" (click)="ban(u)">تأكيد الحظر</button>
                <button class="btn btn-ghost" (click)="banning.set(null)">إلغاء</button>
              </div>
            </td></tr>
          }
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
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  rows = signal<AdminUser[]>([]);
  page = signal(1); pages = signal(1);
  loading = signal(true); error = signal(false);
  banning = signal<string | null>(null);
  q = ''; reason = '';

  ngOnInit() { this.load(); }
  search() { this.page.set(1); this.load(); }
  go(p: number) { this.page.set(p); this.load(); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.api.adminUsers({ q: this.q.trim(), page: this.page() }).subscribe({
      next: r => { this.rows.set(r.items); this.pages.set(Math.max(1, Math.ceil(r.total / r.pageSize))); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
  ban(u: AdminUser) {
    this.api.banUser(u.id, this.reason.trim()).subscribe({
      next: () => { this.banning.set(null); this.reason = ''; this.load(); }, error: () => this.error.set(true) });
  }
  unban(u: AdminUser) { this.api.unbanUser(u.id).subscribe({ next: () => this.load(), error: () => this.error.set(true) }); }
}
