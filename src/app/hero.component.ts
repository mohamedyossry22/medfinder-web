import { Component } from '@angular/core';

/** رسمة تعبيرية: رادار حوالين المستخدم ودبابيس صيدليات بتردّ. زخرفية بس (مخفية عن قارئات الشاشة). */
@Component({
  selector: 'app-hero-art',
  standalone: true,
  template: `
  <div class="art" aria-hidden="true">
    <span class="fill"></span>
    <span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>
    <span class="pulse"></span><span class="pulse p2"></span>
    <span class="pin" style="top:21%;left:60%;background:#12B76A"></span>
    <span class="pin" style="top:63%;left:70%;background:#12B76A"></span>
    <span class="pin" style="top:30%;left:22%;background:#98A2B3"></span>
    <span class="pin" style="top:72%;left:28%;background:#5B8DEF"></span>
    <span class="me"></span>

    <span class="chip c1"><i style="background:#12B76A"></i>PANADOL EXTRA · متوفر</span>
    <span class="chip c2"><i style="background:#12B76A"></i>صيدلية الشفاء · 0.8 كم</span>
    <span class="chip c3"><i style="background:#98A2B3"></i>غير متوفر</span>
  </div>`,
  styles: [`
    .art { position:relative; width:min(100%, 400px); aspect-ratio:1; margin:0 auto; }
    .ring, .pulse, .me, .fill { position:absolute; inset:0; margin:auto; border-radius:50%; }
    .fill { width:100%; height:100%; background:radial-gradient(circle, rgba(255,255,255,.16), rgba(255,255,255,0) 70%); }
    .ring { border:2px solid rgba(255,255,255,.3); }
    .r1 { width:100%; height:100%; } .r2 { width:66%; height:66%; } .r3 { width:33%; height:33%; }
    .pulse { width:100%; height:100%; border:3px solid rgba(255,255,255,.55); animation:pulse 3.2s ease-out infinite; }
    .p2 { animation-delay:1.6s; }
    @keyframes pulse { 0% { transform:scale(.08); opacity:.9; } 100% { transform:scale(1); opacity:0; } }
    .me { width:18px; height:18px; background:#fff; box-shadow:0 0 0 7px rgba(255,255,255,.25); }
    .pin { position:absolute; width:18px; height:18px; border-radius:50%; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.25); }
    .chip { position:absolute; display:inline-flex; align-items:center; gap:8px; background:rgba(0,0,0,.28); backdrop-filter:blur(8px);
            border:1px solid rgba(255,255,255,.3); color:#fff; border-radius:14px; padding:8px 12px; font-size:13px; font-weight:600; white-space:nowrap; }
    .chip i { width:9px; height:9px; border-radius:50%; display:inline-block; }
    .c1 { top:3%; right:-4%; } .c2 { bottom:6%; left:-6%; } .c3 { top:44%; left:-10%; }
    @media (max-width:520px) { .c1 { right:0; } .c2 { left:0; } .c3 { display:none; } }
    @media (prefers-reduced-motion: reduce) { .pulse { animation:none; opacity:.25; transform:scale(.6); } }
  `]
})
export class HeroArtComponent {}