# MedFinder Web (Angular)

لوحة الصيدلية (لايف) + لوحة الأدمن. Angular standalone + Signals + SignalR.

## التجهيز
```
npm i -g @angular/cli
ng new medfinder-web --routing --style=css --ssr=false
cd medfinder-web
npm i @microsoft/signalr
```
1. انسخ محتويات `src/` فوق `src/` بتاع المشروع (استبدل `index.html` و`main.ts` و`styles.css`).
2. لو الـ CLI عمل ملفات `app.ts` / `app.html` / `app.css` / `app.spec.ts` (أو `app.component.*` القديمة) امسحها، إحنا بنستخدم `app/app.component.ts` الموجود.
3. عدّل `src/app/core/config.ts` على عنوان الـ API.
4. في الباك إند حط عنوان الـ Angular في `Cors:Origins` (الافتراضي `http://localhost:4200`).
5. `ng serve` ثم افتح `http://localhost:4200`.

## الصفحات
| المسار | الدور |
|---|---|
| `/login` · `/register` | الجميع (تسجيل صيدلية بصورة الرخصة وموقع GPS أو رابط جوجل ماب) |
| `/pharmacy/incoming` | الطلبات الواردة لايف + 4 أزرار + عدّاد 6 ساعات |
| `/pharmacy/ready` | الجاهزة للتسليم + "تم التسليم" |
| `/pharmacy/requests/:id` | تفاصيل الطلب |
| `/admin/dashboard` | الإحصائيات |
| `/admin/pharmacies` · `/:id` | مراجعة الطلبات: صورة الرخصة بتكبير + قائمة تحقق + اعتماد/رفض بسبب/إيقاف |

## ملاحظات
- **اللايف**: `RealtimeService` بيتصل بـ SignalR، وبعد أي انقطاع بيعيد تحميل القوائم تلقائيًا (عشان ماتفوتش طلبات). فيه نغمة تنبيه + إشعار متصفح لما التاب يكون مخفي.
- **صورة الرخصة**: محمية بالتوكن فبتتجاب كـ blob وبتتعرض بـ object URL.
- **التوكن** متخزن في localStorage (مناسب للـ MVP). لو عايز أمان أعلى بعدين: httpOnly cookies.
- **ما اتجربش**: الكود ما اتبنيش عندي (مفيش Node/Angular هنا). أول `ng serve` ممكن يطلّع أخطاء بسيطة، ابعتهالي.

## الجاي
- إشعارات FCM للويب (الصيدلية تستقبل حتى لو التاب مقفول) — محتاجة Firebase config + service worker.
- صفحات الأدمن: المستخدمين، الإعلانات، الباركودات.
- إعلانات الصيدلية.
