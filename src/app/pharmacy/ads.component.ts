import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { API } from '../core/config';
import { AdBalance, MyAd, PointsHistoryItem } from '../core/models';
import { pointsAr, statusAr } from '../core/fmt';
import { ModalComponent } from './modal.component';

/** باقات الإعلانات: تصميم مبدئي، الأسعار والدفع لسه هيتحددوا */
const AD_PACKAGES = [
  { name: 'إعلان واحد', ads: 1 },
  { name: 'باقة التوفير', ads: 5 },
  { name: 'باقة الصيدلية الذهبية', ads: 10 }
];

const ERRORS: Record<string, string> = {
  invalid_title: 'العنوان غير صالح', image_required: 'صورة الإعلان مطلوبة', invalid_dates: 'التواريخ غير صالحة (الحد الأقصى 3 أيام)',
  invalid_link: 'الرابط غير صالح', pharmacy_not_approved: 'الحساب غير معتمد', invalid_transition: 'العملية دي مش متاحة للإعلان ده دلوقتي'
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00`); x.setDate(x.getDate() + n); return iso(x); };

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
  <div class="row between wrap">
    <p class="muted" style="margin:0">الإعلان بيظهر في تطبيق المستخدمين بعد موافقة الإدارة: للمستخدمين القريبين منك: آخر 5 إعلانات في الصفحة الرئيسية، والباقي في صفحة الإعلانات. مدة الإعلان حتى 3 أيام.</p>
    <button class="btn btn-ghost" type="button" (click)="rules.set(true)">قواعد النقاط والإعلانات</button>
  </div>
  <p class="muted" style="margin:0"><b>نطاق ظهور الإعلان:</b> إعلانك بيظهر بس للمستخدمين اللي في نطاق <b>{{ radius() }} كم</b> من موقع صيدليتك المسجل، فتأكد إن موقع صيدليتك مظبوط في البروفايل.</p>

  <!-- الرصيد -->
  @if (bal(); as b) {
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
      <section class="card" aria-label="رصيد الإعلانات">
        <span class="muted">رصيد الإعلانات المجانية</span>
        <b style="font-size:28px">{{ b.freeAds }} <span class="muted" style="font-size:15px">من {{ b.freeAdsMax }}</span></b>
        <span class="muted" style="font-size:13px">بيتجدد في {{ renews() }}، لحد {{ b.freeAdsMax }} من غير تراكم</span>
      </section>
      <section class="card" aria-label="رصيد النقاط">
        <span class="muted">رصيد النقاط</span>
        <b style="font-size:28px" [style.color]="b.points < 0 ? 'var(--danger)' : ''">{{ b.points }} <span class="muted" style="font-size:15px">نقطة</span></b>
        <span class="muted" style="font-size:13px">
          @if (b.points < 0) { رصيدك بالسالب، وبيتسدد من نقاط الردود الجاية. }
          @else if (b.adsFromPoints > 0) { تكفي لـ {{ b.adsFromPoints }} إعلان (كل {{ b.pointsPerAd }} نقطة = إعلان). }
          @else { فاضل {{ b.pointsPerAd - b.points }} نقطة للإعلان الجاي. }
        </span>
      </section>
      <section class="card" aria-label="الإعلانات المتاحة">
        <span class="muted">تقدر تنشر دلوقتي</span>
        <b style="font-size:28px">{{ available() }} <span class="muted" style="font-size:15px">إعلان</span></b>
        <span class="muted" style="font-size:13px">المجاني بيتخصم الأول، وبعدين النقاط.</span>
      </section>
    </div>
  }

  <!-- إعلان جديد -->
  <form class="card" style="max-width:640px" (ngSubmit)="submit()">
    <h3>إعلان جديد</h3>
    <p class="muted" style="margin:0;font-size:13px">اسم صيدليتك ورقم الموبايل والعنوان والموقع المسجلين في بروفايلك بيظهروا للمستخدمين في تفاصيل الإعلان، والإعلان نفسه بيظهر بس لمن هم في نطاق {{ radius() }} كم من صيدليتك.</p>
    <div class="field"><label for="t">عنوان الإعلان (3 – 80 حرف)</label><input id="t" name="t" [(ngModel)]="f.title" maxlength="80" required></div>
    <div class="field"><label for="l">رابط (اختياري، https فقط)</label><input id="l" name="l" dir="ltr" placeholder="https://..." [(ngModel)]="f.link"></div>
    <div class="row wrap">
      <div class="field grow"><label for="s">من</label><input id="s" name="s" type="date" [min]="today" [(ngModel)]="f.start" (ngModelChange)="clampEnd()" required></div>
      <div class="field grow"><label for="e">إلى (حد أقصى 3 أيام)</label><input id="e" name="e" type="date" [min]="f.start || today" [max]="f.start ? addDays(f.start, 2) : null" [(ngModel)]="f.end" required></div>
    </div>
    <div class="field"><label for="adimg">صورة الإعلان (jpg / png / webp، حتى 5 ميجا)</label>
      <input id="adimg" name="adimg" type="file" accept="image/jpeg,image/png,image/webp" (change)="onFile($event)"></div>
    <div class="muted" style="font-size:13px">هيتخصم من رصيدك: <b>{{ costLabel() }}</b></div>
    @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
    @if (ok()) { <div class="okmsg" role="status">تم إرسال الإعلان للمراجعة</div> }
    <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'جاري الإرسال...' : (available() > 0 ? 'إرسال للمراجعة' : 'اختر باقة') }}</button>
  </form>

  <h3>إعلاناتي</h3>
  @if (actionError()) { <div class="err" role="alert">{{ actionError() }}</div> }
  <div class="grid">
    @for (a of ads(); track a.id) {
      <article class="card">
        <img [src]="url(a.imagePath)" [alt]="a.title" style="width:100%;height:150px;object-fit:cover;border-radius:14px">
        <div class="row between"><b>{{ a.title }}</b><span [class]="'st st-' + shown(a).cls">{{ shown(a).label }}</span></div>
        <div class="muted" style="font-size:13px">{{ a.startDate.slice(0, 10) }} ← {{ a.endDate.slice(0, 10) }}</div>
        @if (a.status === 'Rejected' && a.rejectionReason) { <div class="err">سبب الرفض: {{ a.rejectionReason }}</div> }

        @if (isRunning(a)) {
          @if (stopping() === a.id) {
            <div class="row wrap">
              <button class="btn btn-danger" [disabled]="busyAd() === a.id" (click)="stop(a)">تأكيد الإيقاف</button>
              <button class="btn btn-ghost" (click)="stopping.set(null)">إلغاء</button>
            </div>
            <span class="muted" style="font-size:12px">الإيقاف مابيرجعش الرصيد المخصوم.</span>
          } @else { <button class="btn btn-ghost" (click)="stopping.set(a.id)">إيقاف الإعلان</button> }
        }

        @if (canRepublish(a)) {
          @if (republishing() === a.id) {
            <div class="row wrap">
              <div class="field grow"><label [for]="'rs' + a.id">من</label><input [id]="'rs' + a.id" [name]="'rs' + a.id" type="date" [min]="today" [(ngModel)]="rp.start" (ngModelChange)="rp.end = clamp(rp.start, rp.end)"></div>
              <div class="field grow"><label [for]="'re' + a.id">إلى (حد أقصى 3 أيام)</label><input [id]="'re' + a.id" [name]="'re' + a.id" type="date" [min]="rp.start" [max]="addDays(rp.start, 2)" [(ngModel)]="rp.end"></div>
            </div>
            <span class="muted" style="font-size:13px">هيتخصم من رصيدك: <b>{{ costLabel() }}</b></span>
            <div class="row wrap">
              <button class="btn btn-primary" [disabled]="busyAd() === a.id || !rp.start || !rp.end" (click)="republish(a)">{{ available() > 0 ? 'نشر' : 'اختر باقة' }}</button>
              <button class="btn btn-ghost" (click)="republishing.set(null)">إلغاء</button>
            </div>
          } @else { <button class="btn btn-primary" (click)="openRepublish(a.id)">إعادة نشر</button> }
        }
      </article>
    } @empty { <div class="empty">{{ loading() ? 'جاري التحميل...' : 'لسه ما عملتش إعلانات' }}</div> }
  </div>

  <!-- سجل النقاط -->
  @if (bal(); as b) {
    @if (b.history.length) {
      <h3>سجل النقاط</h3>
      <div class="card" style="max-width:640px">
        @for (h of b.history; track $index) {
          <div class="row between" style="gap:12px">
            <span>{{ reasonLabel(h) }}@if (h.note) { <span class="muted" dir="ltr"> · {{ h.note }}</span> }</span>
            <b [style.color]="h.delta < 0 ? 'var(--danger)' : 'var(--ok)'" dir="ltr">{{ h.delta > 0 ? '+' : '' }}{{ h.delta }}</b>
          </div>
        }
      </div>
    }
  }

  <!-- قواعد النقاط والإعلانات -->
  @if (rules()) {
    <app-modal title="قواعد النقاط والإعلانات" (closed)="rules.set(false)">
      <section>
        <h4 style="margin:0 0 6px">إزاي تكسب نقاط؟</h4>
        <ul style="margin:0;padding-inline-start:20px;line-height:1.9">
          <li>رد في أول 5 دقايق: <b>3 نقاط</b></li>
          <li>رد من 5 لـ 10 دقايق (مثلًا في الدقيقة 7): <b>نقطتين</b></li>
          <li>رد بعد كده: <b>نقطة واحدة</b></li>
          <li>الرد بأي حالة (متوفر / جزئي / غير متوفر) بيتحسب.</li>
          <li>مهلة الرد على أي طلب <b>120 دقيقة</b> من وقت إنشائه.</li>
        </ul>
      </section>
      <section>
        <h4 style="margin:0 0 6px;color:var(--danger)">خصم عدم الرد</h4>
        <p style="margin:0 0 6px;line-height:1.8">لو انتهت مهلة الرد (<b>120 دقيقة</b>) وما رديتش على الطلب خالص، بيتخصم منك <b>نقطتين</b>. لو رصيدك صفر بيبقى <b>-2</b>، وبيتسدد من نقاط الردود الجاية.</p>
        <ul style="margin:0;padding-inline-start:20px;line-height:1.9">
          <li><b>مفيش خصم</b> على الطلبات اللي اتعملت من الساعة <b>12 منتصف الليل لحد 9 الصبح</b> (بتوقيت القاهرة)، حتى لو ما رديتش عليها. ولو رديت عليها بتكسب نقاطها عادي.</li>
          <li>الطلبات اللي اتعملت من <b>9 الصبح لحد 12 منتصف الليل</b> عليها الخصم.</li>
          <li>العبرة بوقت إنشاء الطلب، مش بوقت ما شفته.</li>
        </ul>
      </section>
      <section>
        <h4 style="margin:0 0 6px">إزاي تجيب إعلانات؟</h4>
        <ul style="margin:0;padding-inline-start:20px;line-height:1.9">
          <li>ليك <b>إعلانين مجانيين كل شهر</b>، وبيتجددوا أول كل شهر.</li>
          <li>الإعلانات المجانية مابتتراكمش: لو استخدمت إعلان وفاضلك واحد، في الشهر الجديد بيتضاف واحد بس عشان الرصيد يكمل إعلانين.</li>
          <li>أي إعلانات زيادة بتيجي من النقاط: <b>كل 50 نقطة = إعلان</b>.</li>
          <li>مدة الإعلان <b>لحد 3 أيام</b>.</li>
          <li>الإعلان بيظهر <b>بس للمستخدمين اللي في نطاق {{ radius() }} كم</b> من موقع صيدليتك المسجل (مش لكل المستخدمين).</li>
          <li>تقدر توقف إعلان أو تعيد نشر إعلان قديم، وكل أمر نشر بيخصم من رصيدك (المجاني الأول وبعدين النقاط).</li>
          <li>لو الإدارة رفضت الإعلان قبل ما يظهر، رصيده بيرجع لك.</li>
        </ul>
      </section>
      <button class="btn btn-primary" type="button" (click)="rules.set(false)">تمام</button>
    </app-modal>
  }

  <!-- اختر باقة (تصميم مبدئي) -->
  @if (packages()) {
    <app-modal title="اختر باقة" (closed)="packages.set(false)">
      <p style="margin:0">رصيد إعلاناتك خلص. اختر باقة علشان تكمل النشر.</p>
      <div style="display:grid;gap:10px">
        @for (p of pkgs; track p.name) {
          <div class="row between" style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px 14px">
            <div><b>{{ p.name }}</b><div class="muted" style="font-size:13px">{{ p.ads }} {{ p.ads === 1 ? 'إعلان' : 'إعلانات' }}</div></div>
            <button class="btn btn-ghost" type="button" disabled>قريبًا</button>
          </div>
        }
      </div>
      <p class="muted" style="margin:0;font-size:13px">الباقات والأسعار هتتفعّل قريبًا. لحد وقتها تقدر تنشر من غير دفع بالطرق دي:</p>
      <ul style="margin:0;padding-inline-start:20px;line-height:1.9">
        <li>ارد بسرعة على الطلبات: كل 50 نقطة = إعلان @if (bal(); as b) { (رصيدك {{ pts(b.points) }}) }</li>
        <li>استنى التجديد المجاني @if (bal()) { في {{ renews() }} }</li>
      </ul>
      <button class="btn btn-primary" type="button" (click)="packages.set(false)">تمام</button>
    </app-modal>
  }`
})
export class AdsComponent implements OnInit {
  private api = inject(ApiService);
  ads = signal<MyAd[]>([]);
  bal = signal<AdBalance | null>(null);
  loading = signal(true); busy = signal(false); error = signal(''); ok = signal(false);
  actionError = signal(''); busyAd = signal<string | null>(null);
  rules = signal(false); packages = signal(false);
  stopping = signal<string | null>(null); republishing = signal<string | null>(null);

  today = iso(new Date());
  f = { title: '', link: '', start: '', end: '' };
  rp = { start: '', end: '' };
  file: File | null = null;
  pkgs = AD_PACKAGES;
  pts = pointsAr;
  addDays = addDays;
  url = (p: string) => API + p;

  radius = computed(() => this.bal()?.adRadiusKm ?? 10);
  available = computed(() => { const b = this.bal(); return b ? b.freeAds + b.adsFromPoints : 0; });
  renews = computed(() => { const b = this.bal(); return b ? new Date(b.renewsAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) : ''; });
  costLabel = computed(() => {
    const b = this.bal();
    if (!b) return '—';
    if (b.freeAds > 0) return 'إعلان من الرصيد المجاني';
    if (b.adsFromPoints > 0) return `${b.pointsPerAd} نقطة`;
    return 'مفيش رصيد متاح، هتختار باقة';
  });

  ngOnInit() { this.load(); this.loadBalance(); }
  load() { this.api.myAds().subscribe({ next: r => { this.ads.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  loadBalance() { this.api.adBalance().subscribe({ next: r => this.bal.set(r), error: () => { /* الصفحة شغالة من غير الرصيد */ } }); }
  onFile(e: Event) { this.file = (e.target as HTMLInputElement).files?.[0] ?? null; }

  clamp(start: string, end: string) { return !start ? end : (end < start ? start : end > addDays(start, 2) ? addDays(start, 2) : end); }
  clampEnd() { this.f.end = this.f.end ? this.clamp(this.f.start, this.f.end) : this.f.end; }

  /** الحالة المعروضة: المعتمد اللي انتهى بيظهر "منتهي" */
  shown(a: MyAd) {
    if (a.status === 'Approved' && Date.parse(a.endDate) <= Date.now()) return { label: 'منتهي', cls: 'Expired' };
    return { label: statusAr(a.status), cls: a.status };
  }
  isRunning(a: MyAd) { return a.status === 'Approved' && Date.parse(a.endDate) > Date.now(); }
  canRepublish(a: MyAd) { return a.status === 'Stopped' || (a.status === 'Approved' && Date.parse(a.endDate) <= Date.now()); }

  reasonLabel(h: PointsHistoryItem) {
    return ({ Reply: 'رد على طلب', Missed: 'عدم رد على طلب', AdSpend: 'نشر إعلان', AdRefund: 'استرجاع إعلان مرفوض' } as Record<string, string>)[h.reason] ?? h.reason;
  }

  private fail(e: any, set: (m: string) => void) {
    const c = e?.error?.error;
    if (c === 'no_ad_credit') { this.packages.set(true); this.loadBalance(); return; }
    set(ERRORS[c] ?? c ?? 'حصل خطأ، حاول تاني');
  }

  submit() {
    this.error.set(''); this.ok.set(false);
    if (this.available() <= 0 && this.bal()) { this.packages.set(true); return; }
    const title = this.f.title.trim();
    if (title.length < 3) { this.error.set('العنوان قصير'); return; }
    if (!this.file) { this.error.set('صورة الإعلان مطلوبة'); return; }
    if (this.file.size > 5 * 1024 * 1024) { this.error.set('الصورة أكبر من 5 ميجا'); return; }
    if (!this.f.start || !this.f.end || this.f.end < this.f.start) { this.error.set('تواريخ الإعلان غير صحيحة'); return; }
    if (this.f.end > addDays(this.f.start, 2)) { this.error.set('مدة الإعلان لحد 3 أيام'); return; }
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
        this.load(); this.loadBalance();
      },
      error: e => { this.busy.set(false); this.fail(e, m => this.error.set(m)); }
    });
  }

  stop(a: MyAd) {
    this.busyAd.set(a.id); this.actionError.set('');
    this.api.stopAd(a.id).subscribe({
      next: () => { this.busyAd.set(null); this.stopping.set(null); this.load(); },
      error: e => { this.busyAd.set(null); this.fail(e, m => this.actionError.set(m)); }
    });
  }

  openRepublish(id: string) {
    this.actionError.set('');
    this.rp = { start: this.today, end: addDays(this.today, 2) };
    this.republishing.set(id);
  }

  republish(a: MyAd) {
    if (this.available() <= 0 && this.bal()) { this.packages.set(true); return; }
    this.busyAd.set(a.id); this.actionError.set('');
    this.api.republishAd(a.id, `${this.rp.start}T00:00:00`, `${this.rp.end}T23:59:59`).subscribe({
      next: () => { this.busyAd.set(null); this.republishing.set(null); this.load(); this.loadBalance(); },
      error: e => { this.busyAd.set(null); this.fail(e, m => this.actionError.set(m)); }
    });
  }
}
