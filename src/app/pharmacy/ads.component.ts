import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { API } from '../core/config';
import { MyAd } from '../core/models';
import { statusAr } from '../core/fmt';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [FormsModule],
  template: `
  <p class="muted" style="margin:0">الإعلان بيظهر في الصفحة الرئيسية لتطبيق المستخدمين بعد موافقة الإدارة. مدة الإعلان حتى 90 يوم.</p>

  <form class="card" style="max-width:640px" (ngSubmit)="submit()">
    <h3>إعلان جديد</h3>
    <div class="field"><label for="t">عنوان الإعلان (3 – 80 حرف)</label><input id="t" name="t" [(ngModel)]="f.title" maxlength="80" required></div>
    <div class="field"><label for="l">رابط (اختياري، https فقط)</label><input id="l" name="l" dir="ltr" placeholder="https://..." [(ngModel)]="f.link"></div>
    <div class="row wrap">
      <div class="field grow"><label for="s">من</label><input id="s" name="s" type="date" [(ngModel)]="f.start" required></div>
      <div class="field grow"><label for="e">إلى</label><input id="e" name="e" type="date" [(ngModel)]="f.end" required></div>
    </div>
    <div class="field"><label for="adimg">صورة الإعلان (jpg / png / webp، حتى 5 ميجا)</label>
      <input id="adimg" name="adimg" type="file" accept="image/jpeg,image/png,image/webp" (change)="onFile($event)"></div>
    @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
    @if (ok()) { <div class="okmsg" role="status">تم إرسال الإعلان للمراجعة</div> }
    <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'جاري الإرسال...' : 'إرسال للمراجعة' }}</button>
  </form>

  <h3>إعلاناتي</h3>
  <div class="grid">
    @for (a of ads(); track a.id) {
      <article class="card">
        <img [src]="url(a.imagePath)" [alt]="a.title" style="width:100%;height:150px;object-fit:cover;border-radius:14px">
        <div class="row between"><b>{{ a.title }}</b><span class="st" [class]="'st st-' + a.status">{{ label(a.status) }}</span></div>
        <div class="muted" style="font-size:13px">{{ a.startDate.slice(0, 10) }} ← {{ a.endDate.slice(0, 10) }}</div>
        @if (a.status === 'Rejected' && a.rejectionReason) { <div class="err">سبب الرفض: {{ a.rejectionReason }}</div> }
      </article>
    } @empty { <div class="empty">{{ loading() ? 'جاري التحميل...' : 'لسه ما عملتش إعلانات' }}</div> }
  </div>`
})
export class AdsComponent implements OnInit {
  private api = inject(ApiService);
  ads = signal<MyAd[]>([]);
  loading = signal(true); busy = signal(false); error = signal(''); ok = signal(false);
  f = { title: '', link: '', start: '', end: '' };
  file: File | null = null;
  label = statusAr;
  url = (p: string) => API + p;

  ngOnInit() { this.load(); }
  load() { this.api.myAds().subscribe({ next: r => { this.ads.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  onFile(e: Event) { this.file = (e.target as HTMLInputElement).files?.[0] ?? null; }

  submit() {
    this.error.set(''); this.ok.set(false);
    const title = this.f.title.trim();
    if (title.length < 3) { this.error.set('العنوان قصير'); return; }
    if (!this.file) { this.error.set('صورة الإعلان مطلوبة'); return; }
    if (this.file.size > 5 * 1024 * 1024) { this.error.set('الصورة أكبر من 5 ميجا'); return; }
    if (!this.f.start || !this.f.end || this.f.end < this.f.start) { this.error.set('تواريخ الإعلان غير صحيحة'); return; }
    if (this.f.link.trim() && !this.f.link.trim().startsWith('https://')) { this.error.set('الرابط لازم يبدأ بـ https://'); return; }

    const fd = new FormData();
    fd.set('Title', title);
    if (this.f.link.trim()) fd.set('LinkUrl', this.f.link.trim());
    fd.set('StartDate', `${this.f.start}T00:00:00`);
    fd.set('EndDate', `${this.f.end}T23:59:59`);
    fd.set('Image', this.file);

    this.busy.set(true);
    this.api.createAd(fd).subscribe({
      next: () => {
        this.busy.set(false); this.ok.set(true);
        this.f = { title: '', link: '', start: '', end: '' }; this.file = null;
        const el = document.getElementById('adimg') as HTMLInputElement | null; if (el) el.value = '';
        this.load();
      },
      error: e => { this.busy.set(false); this.error.set(({
        invalid_title: 'العنوان غير صالح', image_required: 'صورة الإعلان مطلوبة', invalid_dates: 'التواريخ غير صالحة (الحد الأقصى 90 يوم)',
        invalid_link: 'الرابط غير صالح', pharmacy_not_approved: 'الحساب غير معتمد'
      } as Record<string, string>)[e?.error?.error] ?? e?.error?.error ?? 'حصل خطأ، حاول تاني'); }
    });
  }
}