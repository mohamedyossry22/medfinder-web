export type Role = "Admin" | "Pharmacy" | "User";
export type PharmacyStatus = "Pending" | "Approved" | "Rejected" | "Suspended";
export type TargetStatus =
  | "Pending"
  | "Available"
  | "Partial"
  | "Unavailable"
  | "Delivered"
  | "Expired";

export interface AuthResponse {
  token: string;
  role: Role;
  fullName: string;
  pharmacyStatus: PharmacyStatus | null;
}

export interface IncomingRequest {
  targetId: string;
  requestId: string;
  drugNameEn: string;
  drugNameAr: string;
  activeIngredient: string | null;
  quantity: number;
  distanceKm: number;
  createdAt: string;
  expiresAt: string;
}
export interface ReadyItem {
  targetId: string;
  drugNameEn: string;
  drugNameAr: string;
  quantity: number;
  availableQty: number;
  status: TargetStatus;
  respondedAt: string;
  expiresAt: string;
}
export interface RequestDetail {
  id: string;
  requestId: string;
  drugNameEn: string;
  drugNameAr: string;
  activeIngredient: string | null;
  manufacturer: string | null;
  route: string | null;
  quantity: number;
  distanceKm: number;
  status: TargetStatus;
  availableQty: number | null;
  createdAt: string;
  expiresAt: string;
}
export interface PharmacyMe {
  id: string;
  name: string;
  pharmacistName: string;
  governorate: string;
  status: PharmacyStatus;
  reason: string | null;
}

export interface Paged<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}
export interface AdminPharmacyRow {
  id: string;
  name: string;
  pharmacistName: string;
  licenseNumber: string;
  governorate: string;
  status: PharmacyStatus;
  createdAt: string;
}
export interface AdminPharmacy extends AdminPharmacyRow {
  mapsUrl: string;
  lat: number;
  lng: number;
  phone: string;
  address: string | null;
  reason: string | null;
  reviewedAt: string | null;
  email: string;
  licenseImageUrl: string;
}
export interface DrugName {
  nameEn: string;
  nameAr: string;
}
export interface Stats {
  users: number;
  pharmacies: Record<string, number>;
  requests: { today: number; week: number; month: number };
  availabilityRate30d: number;
  avgResponseSeconds30d: number | null;
  topRequested: { drug: DrugName; count: number }[];
  unansweredDemand: { drug: DrugName; count: number }[];
  byGovernorate: { governorate: string; requests: number }[];
}

export type AdStatus = "Pending" | "Approved" | "Rejected" | "Stopped";
export interface MyAd {
  id: string;
  title: string;
  imagePath: string;
  linkUrl: string | null;
  startDate: string;
  endDate: string;
  status: AdStatus;
  rejectionReason: string | null;
}
export interface AdminAd {
  id: string;
  title: string;
  imagePath: string;
  linkUrl: string | null;
  startDate: string;
  endDate: string;
  status: AdStatus;
  pharmacyName: string;
}
export interface AdminUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  age: number | null;
  isBanned: boolean;
  banReason: string | null;
  createdAt: string;
}
export interface PendingBarcode {
  id: number;
  code: string;
  confirmCount: number;
  source: string;
  drugId: string;
  drugNameEn: string;
  drugNameAr: string;
}

export interface HistoryItem {
  targetId: string;
  drugNameEn: string;
  drugNameAr: string;
  quantity: number;
  deliveredAt: string;
  confirmedByUser: boolean;
}
export interface HistoryPage {
  total: number;
  totalQuantity: number;
  page: number;
  pageSize: number;
  items: HistoryItem[];
}
export interface PharmacyProfile {
  name: string;
  pharmacistName: string;
  licenseNumber: string;
  governorate: string;
  phone: string;
  address: string | null;
  mapsUrl: string;
  lat: number;
  lng: number;
  status: PharmacyStatus;
  email: string | null;
}
export interface ProfileUpdate {
  pharmacyName?: string;
  pharmacistName?: string;
  phone?: string;
  address?: string;
  governorate?: string;
  mapsUrl?: string;
  lat?: number | null;
  lng?: number | null;
}

export type ComplaintStatus = 'New' | 'InReview' | 'Resolved' | 'Closed';
export type ComplaintCategory = 'Request' | 'Pharmacy' | 'User' | 'App' | 'Other';
export interface AdminComplaint {
  id: string;
  senderRole: 'User' | 'Pharmacy';
  senderName: string;
  senderPhone: string | null;
  senderEmail: string | null;
  pharmacyName: string | null;
  category: ComplaintCategory;
  subject: string;
  message: string;
  status: ComplaintStatus;
  adminReply: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

// ── النقاط ورصيد الإعلانات ──
export interface RespondResult { status: string; pointsAwarded: number; pointsBalance: number | null; }
export type PointsReason = 'Reply' | 'Missed' | 'AdSpend' | 'AdRefund';
export interface PointsHistoryItem { delta: number; reason: PointsReason; note: string | null; createdAt: string; }
export interface AdBalance {
  freeAds: number; freeAdsMax: number; points: number; pointsPerAd: number; adsFromPoints: number;
  maxAdDays: number; renewsAt: string; history: PointsHistoryItem[];
}
