import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { APP_STORE_URL, PLAY_STORE_URL } from '../core/config';
import { LogoComponent } from '../admin/logo.component';
import { HeroArtComponent } from '../hero.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, LogoComponent, HeroArtComponent],
  template: `
  <header class="nav">
    <div class="wrap-in nav-in">
      <a routerLink="/" aria-label="MedFinder"><app-logo [size]="38"></app-logo></a>
      <nav class="links" aria-label="الأقسام">
        <a href="#how">إزاي بيشتغل</a><a href="#users">للمستخدمين</a><a href="#pharmacies">للصيدليات</a><a href="#faq">أسئلة شائعة</a>
      </nav>
      <div class="row">
        @if (dash(); as d) { <a class="btn btn-primary" [routerLink]="d">لوحة التحكم</a> }
        @else {
          <a class="btn btn-ghost hide-s" routerLink="/login">دخول الصيدليات</a>
          <a class="btn btn-primary" routerLink="/register">سجّل صيدليتك</a>
        }
      </div>
    </div>
  </header>

  <main>
    <!-- Hero -->
    <section class="hero">
      <div class="wrap-in hero-in">
        <div class="hero-text">
          <span class="tag">للمستخدمين والصيدليات في مصر</span>
          <h1>دوّر على دواءك من موبايلك، وصيدليات حواليك هتردّ عليك</h1>
          <p>اكتب اسم الدواء أو صوّر الروشتة، ونبعت طلبك لأقرب الصيدليات المعتمدة. تعرف مين عنده الدواء قبل ما تتحرك من مكانك.</p>
          <div class="row wrap">
            @if (play) { <a class="store" [href]="play" target="_blank" rel="noopener"><small>حمّل من</small><b>Google Play</b></a> }
            @else { <span class="store off" aria-disabled="true"><small>قريبًا على</small><b>Google Play</b></span> }
            @if (apple) { <a class="store" [href]="apple" target="_blank" rel="noopener"><small>حمّل من</small><b>App Store</b></a> }
            @else { <span class="store off" aria-disabled="true"><small>قريبًا على</small><b>App Store</b></span> }
          </div>
          <a class="pharm-link" routerLink="/register">عندك صيدلية؟ انضم وابدأ تستقبل الطلبات ←</a>
        </div>
        <div class="hero-card"><app-hero-art></app-hero-art></div>
      </div>
    </section>

    <!-- المشكلة -->
    <section class="sec alt">
      <div class="wrap-in narrow center">
        <h2>تلفّيت على صيدليات كتير عشان تلاقي دواء ناقص؟</h2>
        <p class="lead">الوقت ده بيضيع، وساعات بيكون المريض مستني. MedFinder بيبعت طلبك لكل الصيدليات القريبة مرة واحدة، والصيدليات بتردّ عليك لايف: متوفر، متوفر جزئيًا، أو غير متوفر.</p>
      </div>
    </section>

    <!-- إزاي بيشتغل (للمستخدم) -->
    <section class="sec" id="how">
      <div class="wrap-in">
        <h2 class="center">إزاي بيشتغل؟</h2>
        <div class="steps">
          @for (s of userSteps; track s.t; let i = $index) {
            <article class="step"><span class="num">{{ i + 1 }}</span><h3>{{ s.t }}</h3><p>{{ s.d }}</p></article>
          }
        </div>
      </div>
    </section>

    <!-- للمستخدمين -->
    <section class="sec alt" id="users">
      <div class="wrap-in">
        <span class="tag">للمستخدمين</span>
        <h2>هتستفيد إيه كمستخدم؟</h2>
        <div class="cards">
          @for (b of userBenefits; track b.t) { <article class="feat"><h3>{{ b.t }}</h3><p>{{ b.d }}</p></article> }
        </div>
      </div>
    </section>

    <!-- للصيدليات -->
    <section class="sec" id="pharmacies">
      <div class="wrap-in">
        <span class="tag">للصيدليات</span>
        <h2>صيدليتك تقدر توصل لناس بتدوّر على دواء دلوقتي</h2>
        <div class="steps">
          @for (s of pharmSteps; track s.t; let i = $index) {
            <article class="step"><span class="num">{{ i + 1 }}</span><h3>{{ s.t }}</h3><p>{{ s.d }}</p></article>
          }
        </div>
        <h3 style="margin:36px 0 12px">هتستفيد إيه كصيدلية؟</h3>
        <div class="cards">
          @for (b of pharmBenefits; track b.t) { <article class="feat"><h3>{{ b.t }}</h3><p>{{ b.d }}</p></article> }
        </div>
        <div class="center" style="margin-top:28px">
          <a class="btn btn-primary big" routerLink="/register">سجّل صيدليتك دلوقتي</a>
          <a class="btn btn-ghost big" routerLink="/login">عندي حساب</a>
        </div>
      </div>
    </section>

    <!-- أسئلة شائعة -->
    <section class="sec alt" id="faq">
      <div class="wrap-in narrow">
        <h2 class="center">أسئلة شائعة</h2>
        @for (f of faq; track f.q) {
          <details class="qa"><summary>{{ f.q }}</summary><p>{{ f.a }}</p></details>
        }
      </div>
    </section>

    <!-- نداء أخير -->
    <section class="cta">
      <div class="wrap-in center">
        <h2>جاهز تجرّب؟</h2>
        <p>حمّل التطبيق وابعت أول طلب، أو سجّل صيدليتك وابدأ استقبال الطلبات.</p>
        <div class="row wrap" style="justify-content:center">
          @if (play) { <a class="store inv" [href]="play" target="_blank" rel="noopener"><small>حمّل من</small><b>Google Play</b></a> }
          @else { <span class="store inv off"><small>قريبًا على</small><b>Google Play</b></span> }
          @if (apple) { <a class="store inv" [href]="apple" target="_blank" rel="noopener"><small>حمّل من</small><b>App Store</b></a> }
          @else { <span class="store inv off"><small>قريبًا على</small><b>App Store</b></span> }
        </div>
      </div>
    </section>
  </main>

  <footer class="foot">
    <div class="wrap-in foot-in">
      <app-logo [size]="34" tagline="دوّر على دواءك في أقرب صيدلية"></app-logo>
      <div class="links f">
        <a routerLink="/privacy">سياسة الخصوصية</a><a routerLink="/terms">الشروط والأحكام</a>
        <a routerLink="/login">دخول الصيدليات</a><a routerLink="/register">تسجيل صيدلية</a>
      </div>
    </div>
    <p class="wrap-in disc">MedFinder منصة بتربط المستخدمين بالصيدليات. مش بنبيع أدوية ومش بنقدّم نصيحة طبية، وتوفّر الدواء بيتأكد من الصيدلية نفسها. استشر الصيدلي أو الطبيب دايمًا.</p>
  </footer>`,
  styles: [`
    :host { display:block; background:var(--bg); color:var(--text); }
    .wrap-in { width:min(1120px, 100% - 40px); margin-inline:auto; }
    .narrow { width:min(760px, 100% - 40px); } .center { text-align:center; }
    .nav { position:sticky; top:0; z-index:20; background:color-mix(in srgb, var(--surface) 92%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
    .nav-in { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 0; }
    .links { display:flex; gap:22px; } .links a { color:var(--muted); font-weight:600; font-size:14px; }
    .links a:hover { color:var(--primary-ink); }
    @media (max-width:860px) { .nav .links, .hide-s { display:none; } }

    .hero { background:linear-gradient(180deg, var(--primary-soft), var(--bg)); padding:56px 0 40px; }
    .hero-in { display:grid; grid-template-columns:1.1fr .9fr; gap:40px; align-items:center; }
    .hero h1 { font-size:clamp(28px, 4.2vw, 46px); line-height:1.35; margin:14px 0; }
    .hero p { font-size:17px; line-height:1.8; color:var(--muted); margin:0 0 22px; }
    .hero-card { background:linear-gradient(155deg, #0B7F69, #064A3C); border-radius:32px; padding:36px 28px; box-shadow:0 20px 60px rgba(6,74,60,.25); }
    .pharm-link { display:inline-block; margin-top:18px; font-weight:700; }
    @media (max-width:860px) { .hero-in { grid-template-columns:1fr; } .hero-card { order:-1; } }

    .store { display:inline-flex; flex-direction:column; align-items:flex-start; gap:0; background:#10201C; color:#fff; border-radius:14px; padding:9px 20px; min-width:150px; }
    .store small { font-size:11px; opacity:.8; } .store b { font-size:17px; }
    .store.off { opacity:.55; cursor:default; }
    .store.inv { background:#fff; color:#0B6B58; }

    .sec { padding:64px 0; } .alt { background:var(--surface); border-block:1px solid var(--line); }
    .sec h2 { font-size:clamp(24px, 3vw, 32px); margin:8px 0 22px; line-height:1.4; }
    .lead { font-size:17px; line-height:1.9; color:var(--muted); }

    .steps { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; }
    .step, .feat { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); padding:22px; box-shadow:var(--shadow); }
    .alt .step, .alt .feat { background:var(--bg); }
    .step h3, .feat h3 { margin:10px 0 6px; font-size:17px; } .step p, .feat p { margin:0; color:var(--muted); line-height:1.8; font-size:14.5px; }
    .num { display:inline-flex; width:36px; height:36px; border-radius:50%; background:var(--primary); color:#fff; font-weight:700; align-items:center; justify-content:center; }
    .cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; }
    .btn.big { min-height:50px; padding:0 28px; font-size:16px; margin:0 6px; }

    .qa { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-sm); padding:6px 18px; margin-bottom:12px; }
    .qa summary { cursor:pointer; font-weight:700; padding:12px 0; } .qa p { color:var(--muted); line-height:1.8; margin:0 0 14px; }

    .cta { background:linear-gradient(155deg, #0B7F69, #064A3C); color:#fff; padding:60px 0; }
    .cta h2 { margin:0 0 8px; } .cta p { margin:0 0 22px; opacity:.92; }
    .foot { background:var(--surface); border-top:1px solid var(--line); padding:28px 0 20px; }
    .foot-in { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
    .f { flex-wrap:wrap; } .f a { color:var(--muted); font-size:14px; }
    .disc { color:var(--muted); font-size:12.5px; line-height:1.8; margin-top:18px !important; }
  `]
})
export class LandingComponent {
  private auth = inject(AuthService);
  /** لو المستخدم داخل بالفعل: زرار "لوحة التحكم" بدل التسجيل */
  dash = computed(() => { const r = this.auth.role(); return r ? this.auth.homeFor(r) : null; });
  play = PLAY_STORE_URL; apple = APP_STORE_URL;

  userSteps = [
    { t: 'ابحث عن الدواء', d: 'اكتب الاسم بالعربي أو الإنجليزي، أو صوّر الروشتة أو علبة الدواء ونقرا الأسماء. بتختار الدواء من قاعدة أدوية مسجلة، فمفيش أخطاء كتابة.' },
    { t: 'حدد الكمية والنطاق', d: 'اختار عدد العلب والمسافة اللي تناسبك (1 كم لحد 20 كم)، وابعت الطلب.' },
    { t: 'الصيدليات بتردّ لايف', d: 'الطلب بيوصل لأقرب الصيدليات المعتمدة، وتشوف على الرادار مين ردّ: متوفر، جزئي، أو غير متوفر.' },
    { t: 'كلّمهم واستلم', d: 'للصيدلية اللي قالت متوفر هتلاقي رقمها وعنوانها على الخريطة. استلم دواءك وأكّد الاستلام.' }
  ];
  userBenefits = [
    { t: 'وفّر وقتك ومجهودك', d: 'طلب واحد بيوصل لصيدليات كتير، بدل ما تلف عليهم واحدة واحدة.' },
    { t: 'صيدليات معتمدة', d: 'كل صيدلية بنراجع رخصتها وبياناتها قبل ما تستقبل أي طلب.' },
    { t: 'خصوصيتك محفوظة', d: 'الصيدلية ما بتشوفش اسمك ولا رقمك. بتشوف الدواء والكمية والمسافة بس.' },
    { t: 'ردود لحظية', d: 'إشعار أول ما صيدلية ترد، وحالة الطلب بتتحدث لوحدها.' }
  ];
  pharmSteps = [
    { t: 'سجّل صيدليتك', d: 'ابعت بيانات الصيدلية واسم الصيدلي ورقم الرخصة وصورتها وموقعك.' },
    { t: 'نراجع ونفعّل', d: 'بنراجع الرخصة والبيانات، وهتوصلك رسالة بالنتيجة.' },
    { t: 'استقبل الطلبات لايف', d: 'الطلبات القريبة منك بتظهر فورًا في لوحتك مع نغمة تنبيه وإشعار.' },
    { t: 'ردّ بضغطة وسلّم', d: 'متوفر، متوفر جزئي بكمية، أو غير متوفر. ولما العميل ييجي سجّل "تم التسليم".' }
  ];
  pharmBenefits = [
    { t: 'عملاء جداد حواليك', d: 'ناس بتدوّر على دواء فعلًا في منطقتك، والطلب بيوصلك مباشرة.' },
    { t: 'لوحة لايف سهلة', d: 'من غير Refresh ومن غير مكالمات كتير. كل طلب بأزرار واضحة.' },
    { t: 'سجل بالطلبات المسلّمة', d: 'تابع كل اللي سلّمته من أول يوم، بفلتر أسبوع أو شهر أو سنة أو تاريخ تحدده.' },
    { t: 'إعلانات لصيدليتك', d: 'تقدر تنشر إعلان داخل التطبيق (بعد مراجعة الإدارة).' }
  ];
  faq = [
    { q: 'هل MedFinder بيبيع أدوية أو بيوصّل؟', a: 'لا. المنصة بتربطك بالصيدليات بس. الشراء والتسليم بيتم بينك وبين الصيدلية.' },
    { q: 'هل "متوفر" معناها الدواء محجوز ليا؟', a: 'لا. "متوفر" معناها إن الدواء متاح لحظة الرد. كلّم الصيدلية قبل ما تروح.' },
    { q: 'إزاي بتتأكدوا من الصيدليات؟', a: 'كل صيدلية بتقدّم رقم الرخصة وصورتها، وبنراجعها يدويًا قبل التفعيل.' },
    { q: 'مسح الروشتة دقيق؟', a: 'بنستخدم الذكاء الاصطناعي لقراءة أسماء الأدوية واقتراح الأقرب من قاعدة الأدوية. الخط المكتوب بالإيد ممكن يتقري غلط، فإنت اللي بتأكد الدواء قبل الإرسال.' },
    { q: 'هل الأدوية المخدرة والمؤثرات العقلية بتظهر؟', a: 'لا. بنستبعد الأدوية المقيّدة من البحث.' },
    { q: 'منطقتي مفيهاش صيدليات على التطبيق؟', a: 'التغطية بتزيد مع انضمام صيدليات جديدة. لو مفيش صيدليات في نطاقك التطبيق بيقترح توسيع النطاق.' },
    { q: 'عندي صيدلية، أسجّل إزاي؟', a: 'اضغط "سجّل صيدليتك"، املا البيانات وارفع صورة الرخصة، وهنراجع ونتواصل معاك.' }
  ];
}