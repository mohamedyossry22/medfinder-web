import { PharmacyStatus } from './models';

export const STATUS_AR: Record<string, string> = {
  Pending: 'قيد المراجعة', Approved: 'معتمدة', Rejected: 'مرفوضة', Suspended: 'موقوفة',
  Available: 'متوفر', Partial: 'متوفر جزئي', Unavailable: 'غير متوفر', Delivered: 'تم التسليم', Expired: 'انتهى'
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
