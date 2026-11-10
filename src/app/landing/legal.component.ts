import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL } from '../core/config';
import { LogoComponent } from '../admin/logo.component';

type Kind = 'privacy' | 'terms';

/** مسودة سياسة الخصوصية والشروط. مطلوبة لنشر التطبيق على المتاجر، ولازم تتراجع قانونيًا قبل الإطلاق. */
@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  template: `
  <div class="page">
    <a routerLink="/"><app-logo [size]="36"></app-logo></a>
    <div class="draft" role="note">مسودة: لازم تتراجع من مستشار قانوني (خصوصًا قانون حماية البيانات الشخصية المصري) وتتكمّل ببيانات الجهة المشغّلة قبل النشر.</div>
    <h1>{{ doc().title }}</h1>
    @for (s of doc().sections; track s.h) {
      <section><h2>{{ s.h }}</h2>
        <ul>@for (i of s.items; track i) { <li>{{ i }}</li> }</ul>
      </section>
    }
    <p class="muted">للتواصل: <span dir="ltr">{{ mail }}</span></p>
    <a routerLink="/" class="btn btn-ghost">الرجوع للصفحة الرئيسية</a>
  </div>`,
  styles: [`
    .page { width:min(780px, 100% - 40px); margin:32px auto 60px; display:flex; flex-direction:column; gap:16px; color:var(--text); }
    .draft { background:var(--pa-soft); color:var(--pa); border-radius:var(--radius-sm); padding:12px 16px; font-weight:600; font-size:14px; }
    h1 { margin:6px 0 0; font-size:30px; } h2 { font-size:19px; margin:14px 0 4px; }
    ul { margin:0; padding-inline-start:22px; line-height:2; color:var(--muted); }
    .btn { align-self:flex-start; }
  `]
})
export class LegalComponent {
  kind = input.required<Kind>();
  mail = CONTACT_EMAIL;

  private docs: Record<Kind, { title: string; sections: { h: string; items: string[] }[] }> = {
    privacy: {
      title: 'سياسة الخصوصية',
      sections: [
        { h: 'البيانات اللي بنجمعها', items: [
          'المستخدمين: الاسم، رقم الموبايل، السن.',
          'الموقع الجغرافي لحظة إرسال الطلب فقط، لتحديد الصيدليات القريبة.',
          'تفاصيل الطلبات (الدواء، الكمية، النطاق، الحالة).',
          'الصيدليات: اسم الصيدلية والصيدلي، رقم الرخصة وصورتها، الموقع، الهاتف، البريد الإلكتروني.',
          'رمز الجهاز (Device token) لإرسال الإشعارات.'] },
        { h: 'إزاي بنستخدمها', items: [
          'توصيل طلبك للصيدليات القريبة وإبلاغك بالردود.',
          'مراجعة واعتماد الصيدليات.',
          'إحصائيات تشغيل عامة لتحسين الخدمة.'] },
        { h: 'اللي الصيدلية بتشوفه', items: [
          'الصيدلية بتشوف الدواء والكمية والمسافة بس، ومبتشوفش اسمك ولا رقمك.',
          'بيانات الصيدلية (الاسم والعنوان والهاتف) بتظهر لك فقط لو ردّت "متوفر".'] },
        { h: 'صور الروشتة والعلب', items: [
          'لو استخدمت مسح الروشتة أو العلبة، الصورة بتتبعت لخدمة ذكاء اصطناعي خارجية لقراءة أسماء الأدوية، وما بنخزنها عندنا.'] },
        { h: 'الاحتفاظ بالبيانات وحقوقك', items: [
          'بنحتفظ بسجل الطلبات للإحصائيات وحل النزاعات.',
          'تقدر تطلب الاطلاع على بياناتك أو تصحيحها أو حذفها بالتواصل معانا.'] }
      ]
    },
    terms: {
      title: 'الشروط والأحكام',
      sections: [
        { h: 'طبيعة الخدمة', items: [
          'MedFinder منصة بتربط المستخدمين بالصيدليات، ومش بتبيع أدوية ولا بتوصّلها.',
          'توفّر الدواء بيتأكد من الصيدلية، و"متوفر" بتعني متاح لحظة الرد، مش حجز مضمون.',
          'المنصة لا تقدّم نصيحة طبية. استشر الصيدلي أو الطبيب.'] },
        { h: 'التزامات المستخدم', items: [
          'استخدام الخدمة لأغراض مشروعة وبيانات صحيحة.',
          'عدم إرسال طلبات مزعجة أو مكررة. فيه حد لعدد الطلبات في الساعة.',
          'ممكن نوقف الحساب عند إساءة الاستخدام.'] },
        { h: 'التزامات الصيدليات', items: [
          'تقديم رخصة سارية وبيانات صحيحة، والالتزام بالقوانين المنظّمة لمهنة الصيدلة.',
          'الرد بدقة على توفّر الدواء، وتسجيل التسليم عند حدوثه.',
          'الإعلانات بتخضع لمراجعة الإدارة، ولنا رفض أي إعلان مخالف.'] },
        { h: 'أحكام عامة', items: [
          'ممكن نحدّث الشروط وهنوضّح ده داخل المنصة.',
          'الجهة المشغّلة وبياناتها القانونية: (تُستكمل قبل الإطلاق).'] }
      ]
    }
  };
  doc = computed(() => this.docs[this.kind()]);
}