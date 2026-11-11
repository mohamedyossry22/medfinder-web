import { PharmacyStatus } from './models';

export const STATUS_AR: Record<string, string> = {
  Pending: 'قيد المراجعة', Approved: 'معتمدة', Rejected: 'مرفوضة', Suspended: 'موقوفة',
  Stopped: 'موقوف', Available: 'متوفر', Partial: 'متوفر جزئي', Unavailable: 'غير متوفر', Delivered: 'تم التسليم', Expired: 'انتهى'
};
export const statusAr = (s: PharmacyStatus | string) => STATUS_AR[s] ?? s;

export function timeAgo(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  return `منذ ${Math.floor(m / 60)} ساعة`;
}

export function duration(sec: number | null): string {
  if (sec == null) return '—';
  if (sec < 60) return `${sec} ثانية`;
  return `${Math.round(sec / 60)} دقيقة`;
}

const LIFETIME_MS = 6 * 3600 * 1000;
/** نسبة الوقت المتبقي للطلب (0..1) */
export const remainingFrac = (expiresAt: string, now: number) =>
  Math.min(1, Math.max(0, (Date.parse(expiresAt) - now) / LIFETIME_MS));
export const hoursLeft = (expiresAt: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 3600000));

export const COMPLAINT_STATUS_AR: Record<string, string> = { New: 'جديدة', InReview: 'قيد المراجعة', Resolved: 'تم الحل', Closed: 'مغلقة' };
export const CATEGORY_AR: Record<string, string> = {
  Request: 'مشكلة في طلب', Pharmacy: 'عن صيدلية', User: 'عن مستخدم', App: 'مشكلة في التطبيق', Other: 'أخرى'
};
export const complaintStatusAr = (s: string) => COMPLAINT_STATUS_AR[s] ?? s;
export const categoryAr = (c: string) => CATEGORY_AR[c] ?? c;

/** نقطة واحدة / نقطتين / 3 نقاط / 15 نقطة */
export function pointsAr(n: number): string {
  const a = Math.abs(n);
  if (a === 1) return 'نقطة واحدة';
  if (a === 2) return 'نقطتين';
  return `${a} ${a >= 3 && a <= 10 ? 'نقاط' : 'نقطة'}`;
}
