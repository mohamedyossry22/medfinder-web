import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../core/api.service';
import { RealtimeService } from '../core/realtime.service';
import { AdminComplaint, ComplaintStatus } from '../core/models';
import { categoryAr, complaintStatusAr } from '../core/fmt';
import { ComplaintsStore } from './complaints.store';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [FormsModule],
  template: `
  <header class="top"><h1>الشكاوى</h1>
    <form class="row wrap" (ngSubmit)="search()">
      <select name="role" [(ngModel)]="role" (ngModelChange)="search()" style="width:150px" aria-label="نوع المرسل">
        <option value="">الكل</option><option value="User">مستخدمين</option><option value="Pharmacy">صيدليات</option>
      </select>
      <input name="q" [(ngModel)]="q" placeholder="بحث في العنوان أو النص أو الاسم" style="width:260px">
      <button class="btn btn-primary" type="submit">بحث</button>
    </form>
  </header>
  <p class="muted" style="margin:0">الشكاوى من المستخدمين والصيدليات بتوصل هنا لحظيًا. ردّك بيوصل لصاحب الشكوى كإشعار وبيظهر في التطبيق.</p>

  <div class="tabs" role="tablist">
    @for (t of tabs; track t.v) { <button class="tab" role="tab" [class.on]="status() === t.v" (click)="setStatus(t.v)">{{ t.l }}</button> }
  </div>
  @if (error()) { <div class="err" role="alert">{{ error() }}</div> }

  <div class="grid">
    @for (c of rows(); track c.id) {
      <article class="card">
        <div class="row between">
          <b>{{ c.subject }}</b>
          <span [class]="'st st-' + c.status">{{ statusLabel(c.status) }}</span>
        </div>
        <div class="muted" style="font-size:13px">
          {{ c.senderRole === 'Pharmacy' ? 'صيدلية' : 'مستخدم' }}: {{ c.senderName }}@if (c.pharmacyName) { · {{ c.pharmacyName }} }
          · {{ catLabel(c.category) }} · {{ when(c.createdAt) }}
        </div>
        <div class="muted" style="font-size:13px" dir="ltr" [style.text-align]="'start'">
          {{ c.senderPhone || c.senderEmail || '' }}
        </div>
        <p style="margin:6px 0;white-space:pre-wrap">{{ c.message }}</p>

        @if (c.adminReply) {
          <div class="muted" style="border-inline-start:3px solid var(--primary);padding-inline-start:10px">
            <b style="font-size:13px">ردّك{{ c.reviewedAt ? ' · ' + when(c.reviewedAt) : '' }}</b>
            <div style="white-space:pre-wrap">{{ c.adminReply }}</div>
          </div>
        }

        @if (c.status !== 'Closed') {
          <div class="field">
            <label [for]="'rp' + c.id">{{ c.adminReply ? 'تعديل / إضافة رد' : 'الرد على الشكوى' }}</label>
            <textarea [id]="'rp' + c.id" [name]="'rp' + c.id" rows="3" maxlength="1000" [(ngModel)]="drafts[c.id]" placeholder="اكتب ردك لصاحب الشكوى"></textarea>
          </div>
          <div class="row wrap">
            @if (c.status === 'New') {
              <button class="btn btn-ghost" [disabled]="busy() === c.id" (click)="act(c, 'InReview')">قيد المراجعة</button>
            }
            <button class="btn btn-primary" [disabled]="busy() === c.id || !draft(c)" (click)="act(c, 'Resolved')">تم الحل</button>
            <button class="btn btn-danger" [disabled]="busy() === c.id || !draft(c)" (click)="act(c, 'Closed')">إغلاق</button>
          </div>
        }
      </article>
    } @empty { <div class="empty">{{ loading() ? 'جاري التحميل...' : 'لا توجد شكاوى' }}</div> }
  </div>

  @if (pages() > 1) {
    <div class="row" style="justify-content:center">
      <button class="btn btn-ghost" [disabled]="page() <= 1" (click)="go(page() - 1)">السابق</button>
      <span class="muted">{{ page() }} / {{ pages() }}</span>
      <button class="btn btn-ghost" [disabled]="page() >= pages()" (click)="go(page() + 1)">التالي</button>
    </div>
  }`
})
export class ComplaintsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private rt = inject(RealtimeService);
  private store = inject(ComplaintsStore);
  private sub?: Subscription;

  tabs: { v: ComplaintStatus | ''; l: string }[] = [
    { v: 'New', l: 'جديدة' }, { v: 'InReview', l: 'قيد المراجعة' }, { v: 'Resolved', l: 'تم الحل' }, { v: 'Closed', l: 'مغلقة' }, { v: '', l: 'الكل' }];
  status = signal<ComplaintStatus | ''>('New');
  rows = signal<AdminComplaint[]>([]);
  page = signal(1); pages = signal(1);
  loading = signal(true); error = signal('');
  busy = signal<string | null>(null);
  drafts: Record<string, string> = {};
  role: '' | 'User' | 'Pharmacy' = '';
  q = '';
  statusLabel = complaintStatusAr;
  catLabel = categoryAr;

  ngOnInit() {
    this.load();
    // شكوى جديدة وصلت وإحنا فاتحين الصفحة: نحدّث القايمة من غير ما نمسح اللي بتكتبه
    this.sub = this.rt.newComplaint$.subscribe(() => this.load(false));
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  draft(c: AdminComplaint) { return (this.drafts[c.id] ?? '').trim(); }
  when(iso: string) { return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }); }
  setStatus(s: ComplaintStatus | '') { this.status.set(s); this.page.set(1); this.load(); }
  search() { this.page.set(1); this.load(); }
  go(p: number) { this.page.set(p); this.load(); }

  load(spinner = true) {
    if (spinner) this.loading.set(true);
    this.error.set('');
    this.api.adminComplaints({ status: this.status(), role: this.role, q: this.q.trim(), page: this.page() }).subscribe({
      next: r => { this.rows.set(r.items); this.pages.set(Math.max(1, Math.ceil(r.total / r.pageSize))); this.loading.set(false); },
      error: () => { this.error.set('حصل خطأ، حاول تاني'); this.loading.set(false); }
    });
  }

  act(c: AdminComplaint, status: ComplaintStatus) {
    this.busy.set(c.id); this.error.set('');
    this.api.respondComplaint(c.id, status, this.draft(c)).subscribe({
      next: () => { this.busy.set(null); delete this.drafts[c.id]; this.store.refresh(); this.load(false); },
      error: e => {
        this.busy.set(null);
        this.error.set(e?.error?.error === 'reply_required' ? 'اكتب ردًا قبل الحل أو الإغلاق' : 'حصل خطأ، حاول تاني');
      }
    });
  }
}
