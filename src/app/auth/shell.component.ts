import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../admin/logo.component';
import { HeroArtComponent } from '../hero.component';

/** إطار صفحات الدخول والتسجيل: الفورم على اليمين وصورة/رسمة على الشمال (بتختفي على الموبايل). */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterLink, LogoComponent, HeroArtComponent],
  template: `
  <div class="auth">
    <section class="form-side">
      <a routerLink="/" class="back">الصفحة الرئيسية ←</a>
      <div class="inner" [class.wide]="wide()">
        <app-logo [size]="46" tagline="دوّر على دواءك في أقرب صيدلية"></app-logo>
        <ng-content></ng-content>
      </div>
      <small class="foot">© MedFinder</small>
    </section>

    <aside class="hero">
      <div class="hero-in">
        <h2>صيدليتك على الخريطة، وعملاؤك بيدوّروا عليك</h2>
        <p>استقبل طلبات الأدوية من الناس اللي حواليك لحظة بلحظة، وردّ بضغطة واحدة.</p>
        <app-hero-art></app-hero-art>
        <ul>
          <li>طلبات لايف بتنبيه صوتي وإشعارات</li>
          <li>ردّ بـ "متوفر" أو "جزئي" أو "غير متوفر"</li>
          <li>سجل كامل بالطلبات اللي سلّمتها</li>
        </ul>
      </div>
    </aside>
  </div>`,
  styles: [`
    .auth { display:grid; grid-template-columns:minmax(380px, 520px) 1fr; min-height:100vh; }
    .form-side { display:flex; flex-direction:column; padding:20px 32px; background:var(--bg);height:100vh;overflow:auto; }
    .back { color:var(--muted); font-size:14px; align-self:flex-start; padding:6px 0; }
    .inner { margin:auto 0; width:100%; max-width:400px; align-self:center; display:flex; flex-direction:column; gap:22px; padding:24px 0; }
    .inner.wide { max-width:520px; }
    .foot { color:var(--muted); text-align:center; }
    .hero {height: 100vh; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:48px;
            background:linear-gradient(155deg, #0B7F69 0%, #086654 55%, #064A3C 100%); color:#fff; }
    .hero::before, .hero::after { content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,.06); }
    .hero::before { width:520px; height:520px; top:-200px; left:-160px; }
    .hero::after { width:380px; height:380px; bottom:-150px; right:-100px; }
    .hero-in { position:relative; z-index:1; max-width:520px; text-align:center; display:flex; flex-direction:column; gap:20px; align-items:center; }
    h2 { margin:0; font-size:30px; line-height:1.4; }
    p { margin:0; font-size:16px; opacity:.92; line-height:1.7; }
    ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
    li { font-size:14px; } li::before { content:'✓'; margin-inline-end:8px; font-weight:700; }
    app-hero-art { width:70%; padding:10px 24px; }
    @media (max-width:900px) { .auth { grid-template-columns:1fr; } .hero { display:none; } .form-side { padding:16px 20px; } }
  `]
})
export class AuthShellComponent { wide = input(false); }