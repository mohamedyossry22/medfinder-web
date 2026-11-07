import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
  <div class="center-page">
    <form class="card auth-card" (ngSubmit)="submit()">
      <div class="brand" style="padding:0">MedFinder</div>
      <h2>تسجيل الدخول</h2>
      <p class="muted" style="margin:0">للصيدليات ولوحة الإدارة</p>

      <div class="field">
        <label for="email">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" dir="ltr" autocomplete="username" [(ngModel)]="email" required>
      </div>
      <div class="field">
        <label for="pw">كلمة المرور</label>
        <input id="pw" name="pw" type="password" dir="ltr" autocomplete="current-password" [(ngModel)]="password" required>
      </div>

      @if (error()) { <div class="err" role="alert">{{ error() }}</div> }

      <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'جاري الدخول...' : 'دخول' }}</button>
      <div class="muted" style="text-align:center">صيدلية جديدة؟ <a routerLink="/register">سجّل صيدليتك</a></div>
    </form>
  </div>`
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = '';
  busy = signal(false); error = signal('');

  submit() {
    if (!this.email || !this.password) return;
    this.busy.set(true); this.error.set('');
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: r => this.router.navigateByUrl(this.auth.homeFor(r.role)),
      error: e => {
        this.busy.set(false);
        const c = e?.error?.error;
        this.error.set(c === 'locked_out' ? 'الحساب مقفول مؤقتًا بسبب محاولات كتيرة، حاول بعد 15 دقيقة'
          : c === 'banned' ? 'الحساب موقوف'
          : e.status === 429 ? 'محاولات كتيرة، استنى شوية'
          : e.status === 0 ? 'تعذر الاتصال بالسيرفر'
          : 'البريد أو كلمة المرور غير صحيحة');
      }
    });
  }
}
