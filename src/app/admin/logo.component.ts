import { Component, input } from '@angular/core';

/** لوجو MedFinder: دبوس موقع فيه علامة طبية. onDark للخلفيات الغامقة (مثل لوحة الدخول). */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
  <span class="logo" role="img" aria-label="MedFinder">
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" [attr.fill]="onDark() ? '#FFFFFF' : '#0B7F69'"/>
      <path d="M32 10a16 16 0 0 0-16 16c0 12 16 28 16 28s16-16 16-28a16 16 0 0 0-16-16z" [attr.fill]="onDark() ? '#0B7F69' : '#FFFFFF'"/>
      <path d="M29 18h6v5h5v6h-5v5h-6v-5h-5v-6h5z" [attr.fill]="onDark() ? '#FFFFFF' : '#0B7F69'"/>
    </svg>
    @if (showText()) {
      <span class="txt">
        <b dir="ltr" [style.font-size.px]="size() * 0.52" [class.dark]="onDark()"><span class="a">Med</span><span class="b">Finder</span></b>
        @if (tagline()) { <small [class.dark]="onDark()">{{ tagline() }}</small> }
      </span>
    }
  </span>`,
  styles: [`
    .logo { display:inline-flex; align-items:center; gap:10px; }
    .txt { display:flex; flex-direction:column; line-height:1.15; }
    b { letter-spacing:.2px; color:var(--text); }
    .a { font-weight:400; } .b { font-weight:800; color:var(--primary); }
    b.dark, b.dark .b { color:#fff; }
    small { color:var(--muted); font-size:12px; } small.dark { color:rgba(255,255,255,.8); }
  `]
})
export class LogoComponent {
  size = input(40);
  showText = input(true);
  tagline = input('');
  onDark = input(false);
}