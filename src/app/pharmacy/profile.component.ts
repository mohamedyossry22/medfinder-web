import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { PharmacyProfile } from '../core/models';
import { statusAr } from '../core/fmt';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
  @if (loadError()) { <div class="err" role="alert">تعذر تحميل البيانات</div> }
  @if (p(); as x) {
    <form class="card" style="max-width:640px" (ngSubmit)="save()">
      <div class="row between">
        <h3>بيانات الصيدلية</h3>
        <span class="st" [class]="'st st-' + x.status">{{ label(x.status) }}</span>
      </div>

      <div class="field"><label for="n">اسم الصيدلية</label><input id="n" name="n" [(ngModel)]="f.pharmacyName" required></div>
      <div class="field"><label for="ph">اسم الصيدلي</label><input id="ph" name="ph" [(ngModel)]="f.pharmacistName" required></div>
      <div class="row wrap">
        <div class="field grow"><label for="phone">الهاتف</label><input id="phone" name="phone" dir="ltr" [(ngModel)]="f.phone" required></div>
        <div class="field grow"><label for="gov">المحافظة</label>
          <select id="gov" name="gov" [(ngModel)]="f.governorate">
            @for (g of govs(); track g) { <option [value]="g">{{ g }}</option> }
          </select>
        </div>
      </div>
      <div class="field"><label for="addr">العنوان</label><input id="addr" name="addr" [(ngModel)]="f.address"></div>

      <div class="field">
        <label for="maps">رابط Google Maps</label>
        <input id="maps" name="maps" dir="ltr" [(ngModel)]="f.mapsUrl">
        <div class="row wrap">
          <button type="button" class="btn btn-ghost" (click)="useMyLocation()">📍 استخدم موقعي الحالي (وأنا في الصيدلية)</button>
          <span class="muted" dir="ltr" style="font-size:12px">{{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}</span>
        </div>
        <span class="muted" style="font-size:12px">موقعك بيحدد الطلبات اللي بتوصلك، فخليه دقيق.</span>
      </div>

      <hr style="border:0;border-top:1px solid var(--line);width:100%">
      <div class="muted" style="font-size:13px">
        بيانات مش بتتعدل من هنا (محتاجة مراجعة الإدارة):
        رقم الرخصة <b dir="ltr">{{ x.licenseNumber }}</b> · البريد <b dir="ltr">{{ x.email }}</b>
      </div>

      @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
      @if (ok()) { <div class="okmsg" role="status">تم حفظ التعديلات</div> }
      <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'جاري الحفظ...' : 'حفظ التعديلات' }}</button>
    </form>
  }`
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  p = signal<PharmacyProfile | null>(null);
  govs = signal<string[]>([]);
  busy = signal(false); error = signal(''); ok = signal(false); loadError = signal(false);
  f = { pharmacyName: '', pharmacistName: '', phone: '', address: '', governorate: '', mapsUrl: '' };
  lat = 0; lng = 0; private newCoords = false;
  label = statusAr;

  ngOnInit() {
    this.api.governorates().subscribe(g => this.govs.set(g));
    this.api.profile().subscribe({ next: r => this.fill(r), error: () => this.loadError.set(true) });
  }

  private fill(r: PharmacyProfile) {
    this.p.set(r);
    this.f = { pharmacyName: r.name, pharmacistName: r.pharmacistName, phone: r.phone, address: r.address ?? '', governorate: r.governorate, mapsUrl: r.mapsUrl };
    this.lat = r.lat; this.lng = r.lng; this.newCoords = false;
  }

  useMyLocation() {
    if (!navigator.geolocation) { this.error.set('المتصفح لا يدعم تحديد الموقع'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { this.lat = pos.coords.latitude; this.lng = pos.coords.longitude; this.newCoords = true; this.error.set(''); },
      () => this.error.set('تعذر الحصول على الموقع، اسمح للمتصفح أو أدخل رابط Google Maps'),
      { enableHighAccuracy: true, timeout: 10000 });
  }

  save() {
    this.error.set(''); this.ok.set(false); this.busy.set(true);
    this.api.updateProfile({
      pharmacyName: this.f.pharmacyName, pharmacistName: this.f.pharmacistName, phone: this.f.phone,
      address: this.f.address, governorate: this.f.governorate, mapsUrl: this.f.mapsUrl,
      lat: this.newCoords ? this.lat : null, lng: this.newCoords ? this.lng : null
    }).subscribe({
      next: r => { this.busy.set(false); this.ok.set(true); this.fill(r); },
      error: e => { this.busy.set(false); this.error.set(e?.error?.error ?? 'حصل خطأ، حاول تاني'); }
    });
  }
}
