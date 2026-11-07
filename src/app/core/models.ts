export type Role = 'Admin' | 'Pharmacy' | 'User';
export type PharmacyStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
export type TargetStatus = 'Pending' | 'Available' | 'Partial' | 'Unavailable' | 'Delivered' | 'Expired';

export interface AuthResponse { token: string; role: Role; fullName: string; pharmacyStatus: PharmacyStatus | null; }

export interface IncomingRequest {
  targetId: string; requestId: string; drugNameEn: string; drugNameAr: string; activeIngredient: string | null;
  quantity: number; distanceKm: number; createdAt: string; expiresAt: string;
}
export interface ReadyItem {
  targetId: string; drugNameEn: string; drugNameAr: string; quantity: number; availableQty: number;
  status: TargetStatus; respondedAt: string; expiresAt: string;
}
export interface RequestDetail {
  id: string; requestId: string; drugNameEn: string; drugNameAr: string; activeIngredient: string | null;
  manufacturer: string | null; route: string | null; quantity: number; distanceKm: number;
  status: TargetStatus; availableQty: number | null; createdAt: string; expiresAt: string;
}
export interface PharmacyMe { id: string; name: string; pharmacistName: string; governorate: string; status: PharmacyStatus; reason: string | null; }

export interface Paged<T> { total: number; page: number; pageSize: number; items: T[]; }
export interface AdminPharmacyRow { id: string; name: string; pharmacistName: string; licenseNumber: string; governorate: string; status: PharmacyStatus; createdAt: string; }
export interface AdminPharmacy extends AdminPharmacyRow {
  mapsUrl: string; lat: number; lng: number; phone: string; address: string | null; reason: string | null;
  reviewedAt: string | null; email: string; licenseImageUrl: string;
}
export interface DrugName { nameEn: string; nameAr: string; }
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
