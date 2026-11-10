import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { AuthShellComponent } from './shell.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent],
  template: `
  <app-auth-shell [wide]="true">
    @if (done()) {
      <div class="stack" style="text-align:center">
        <h1 style="font-size:26px">تم استلام طلبك ✓</h1>
        <p class="muted">هنراجع بيانات الصيدلية ورقم الرخصة، وهنبعتلك رسالة على رقمك لما يتم الاعتماد.</p>
        <a class="btn btn-primary" routerLink="/login">تسجيل الدخول</a>
      </div>
    } @else {
    <form class="stack" (ngSubmit)="submit()">
      <div>
        <h1 style="font-size:26px">تسجيل صيدلية جديدة</h1>
        <p class="muted" style="margin:6px 0 0">املا البيانات وارفع صورة الرخصة، وهنراجعها ونفعّل حسابك.</p>
      </div>

      <div class="field"><label for="pn">اسم الصيدلية</label><input id="pn" name="pn" [(ngModel)]="f.pharmacyName" required></div>
      <div class="field"><label for="ph">اسم الصيدلي</label><input id="ph" name="ph" [(ngModel)]="f.pharmacistName" required></div>
      <div class="row wrap">
        <div class="field grow"><label for="lic">رقم الرخصة</label><input id="lic" name="lic" dir="ltr" [(ngModel)]="f.licenseNumber" required></div>
        <div class="field grow"><label for="gov">المحافظة</label>
          <select id="gov" name="gov" [(ngModel)]="f.governorate" required>
            <option value="" disabled>اختر</option>
            @for (g of govs(); track g) { <option [value]="g">{{ g }}</option> }
          </select>
        </div>
      </div>
      <div class="field"><label for="phone">رقم هاتف الصيدلية</label><input id="phone" name="phone" dir="ltr" inputmode="tel" [(ngModel)]="f.phone" required></div>
      <div class="field"><label for="addr">العنوان (اختياري)</label><input id="addr" name="addr" [(ngModel)]="f.address"></div>

      <div class="field">
        <label for="maps">رابط الصيدلية على Google Maps</label>
        <input id="maps" name="maps" dir="ltr" placeholder="https://maps.app.goo.gl/..." [(ngModel)]="f.mapsUrl">
        <div class="row wrap">
          <button type="button" class="btn btn-ghost" (click)="useMyLocation()">📍 استخدم موقعي الحالي (وأنا في الصيدلية)</button>
          @if (lat !== null) { <span class="tag">تم تحديد الموقع</span> }
        </div>
        <span class="muted" style="font-size:12px">الأفضل تضغط الزرار وإنت في الصيدلية للحصول على أدق موقع.</span>
      </div>

      <div class="field">
        <label for="img">صورة الرخصة (واضحة، jpg / png / webp، حتى 5 ميجا)</label>
        <input id="img" name="img" type="file" accept="image/jpeg,image/png,image/webp" (change)="onFile($event)" required>
      </div>

      <div class="field"><label for="em">البريد الإلكتروني</label><input id="em" name="em" type="email" dir="ltr" autocomplete="username" [(ngModel)]="f.email" required></div>
      <div class="field"><label for="pw">كلمة المرور (8 أحرف على الأقل)</label><input id="pw" name="pw" type="password" dir="ltr" autocomplete="new-password" [(ngModel)]="f.password" required minlength="8"></div>

      @if (error()) { <div class="err" role="alert">{{ error() }}</div> }
      <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'جاري الإرسال...' : 'إرسال طلب التسجيل' }}</button>
      <div class="muted" style="text-align:center">عندك حساب؟ <a routerLink="/login"><b>تسجيل الدخول</b></a></div>
    </form>
    }
  </app-auth-shell>`
})
export class RegisterComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  govs = signal<string[]>([]);
  busy = signal(false); error = signal(''); done = signal(false);
  file: File | null = null; lat: number | null = null; lng: number | null = null;
  f = { pharmacyName: '', pharmacistName: '', licenseNumber: '', governorate: '', phone: '', address: '', mapsUrl: '', email: '', password: '' };

  ngOnInit() { this.api.governorates().subscribe(g => this.govs.set(g)); }

  onFile(e: Event) { this.file = (e.target as HTMLInputElement).files?.[0] ?? null; }

  useMyLocation() {
    if (!navigator.geolocation) { this.error.set('المتصفح لا يدعم تحديد الموقع'); return; }
    navigator.geolocation.getCurrentPosition(
      p => { this.lat = p.coords.latitude; this.lng = p.coords.longitude; this.error.set(''); },
      () => this.error.set('تعذر الحصول على الموقع، اسمح للمتصفح أو أدخل رابط Google Maps'),
      { enableHighAccuracy: true, timeout: 10000 });
  }

  submit() {
    this.error.set('');
    if (!this.file) { this.error.set('صورة الرخصة مطلوبة'); return; }
    if (this.lat === null && !this.f.mapsUrl.trim()) { this.error.set('حدد موقع الصيدلية: رابط Google Maps أو زرار موقعي الحالي'); return; }
    const fd = new FormData();
    fd.set('Email', this.f.email.trim()); fd.set('Password', this.f.password);
    fd.set('PharmacyName', this.f.pharmacyName.trim()); fd.set('PharmacistName', this.f.pharmacistName.trim());
    fd.set('LicenseNumber', this.f.licenseNumber.trim()); fd.set('Governorate', this.f.governorate);
    fd.set('Phone', this.f.phone.trim()); fd.set('Address', this.f.address.trim()); fd.set('MapsUrl', this.f.mapsUrl.trim());
    if (this.lat !== null && this.lng !== null) { fd.set('Lat', String(this.lat)); fd.set('Lng', String(this.lng)); }
    fd.set('LicenseImage', this.file);

    this.busy.set(true);
    this.auth.register(fd).subscribe({
      next: () => { this.busy.set(false); this.done.set(true); },
      error: e => { this.busy.set(false); this.error.set(e?.error?.error ?? 'حصل خطأ، حاول تاني'); }
    });
  }
}