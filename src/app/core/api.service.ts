import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './config';
import {
  HistoryPage, PharmacyProfile, ProfileUpdate, AdminAd, AdminPharmacy, AdminPharmacyRow, AdminUser, AdStatus, IncomingRequest, MyAd, Paged, PendingBarcode,
  PharmacyMe, PharmacyStatus, ReadyItem, RequestDetail, Stats
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  governorates() { return this.http.get<string[]>(`${API}/api/meta/governorates`); }

  // ── الصيدلية ──
  me() { return this.http.get<PharmacyMe>(`${API}/api/pharmacy/me`); }
  incoming() { return this.http.get<IncomingRequest[]>(`${API}/api/pharmacy/requests/incoming`); }
  request(targetId: string) { return this.http.get<RequestDetail>(`${API}/api/pharmacy/requests/${targetId}`); }
  respond(targetId: string, status: 'Available' | 'Partial' | 'Unavailable', availableQty?: number) {
    return this.http.post(`${API}/api/pharmacy/requests/${targetId}/respond`, { status, availableQty: availableQty ?? null });
  }
  ready() { return this.http.get<ReadyItem[]>(`${API}/api/pharmacy/ready`); }
  deliver(targetId: string) { return this.http.post(`${API}/api/pharmacy/ready/${targetId}/deliver`, {}); }

  // ── الأدمن ──
  stats() { return this.http.get<Stats>(`${API}/api/admin/stats`); }
  adminPharmacies(p: { status?: PharmacyStatus | ''; q?: string; page?: number }) {
    let params = new HttpParams().set('page', p.page ?? 1).set('pageSize', 15);
    if (p.status) params = params.set('status', p.status);
    if (p.q) params = params.set('q', p.q);
    return this.http.get<Paged<AdminPharmacyRow>>(`${API}/api/admin/pharmacies`, { params });
  }
  adminPharmacy(id: string) { return this.http.get<AdminPharmacy>(`${API}/api/admin/pharmacies/${id}`); }
  /** الصورة محمية بالتوكن، فنجيبها blob ونعرضها بـ object URL */
  license(id: string) { return this.http.get(`${API}/api/admin/pharmacies/${id}/license`, { responseType: 'blob' }); }
  pharmacyAction(id: string, action: 'approve' | 'reject' | 'suspend' | 'activate', reason?: string) {
    return this.http.post(`${API}/api/admin/pharmacies/${id}/${action}`, { reason: reason ?? null });
  }

  // ── سجل المسلّم + بيانات الصيدلية ──
  history(p: { from?: string; to?: string; page?: number }) {
    let params = new HttpParams().set('page', p.page ?? 1).set('pageSize', 15);
    if (p.from) params = params.set('from', p.from);
    if (p.to) params = params.set('to', p.to);
    return this.http.get<HistoryPage>(`${API}/api/pharmacy/history`, { params });
  }
  profile() { return this.http.get<PharmacyProfile>(`${API}/api/pharmacy/profile`); }
  updateProfile(b: ProfileUpdate) { return this.http.put<PharmacyProfile>(`${API}/api/pharmacy/profile`, b); }

  // ── الأجهزة (إشعارات) ──
  registerDevice(token: string) { return this.http.post(`${API}/api/devices`, { token, platform: 'web' }); }
  unregisterDevice(token: string) { return this.http.post(`${API}/api/devices/unregister`, { token, platform: 'web' }); }

  // ── إعلانات الصيدلية ──
  myAds() { return this.http.get<MyAd[]>(`${API}/api/pharmacy/ads`); }
  createAd(fd: FormData) { return this.http.post(`${API}/api/pharmacy/ads`, fd); }

  // ── الأدمن: المستخدمين / الإعلانات / الباركودات ──
  adminUsers(p: { q?: string; page?: number }) {
    let params = new HttpParams().set('page', p.page ?? 1).set('pageSize', 15);
    if (p.q) params = params.set('q', p.q);
    return this.http.get<Paged<AdminUser>>(`${API}/api/admin/users`, { params });
  }
  banUser(id: string, reason: string) { return this.http.post(`${API}/api/admin/users/${id}/ban`, { reason }); }
  unbanUser(id: string) { return this.http.post(`${API}/api/admin/users/${id}/unban`, {}); }

  adminAds(status: AdStatus | '') {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<AdminAd[]>(`${API}/api/admin/ads`, { params });
  }
  adAction(id: string, action: 'approve' | 'reject', reason?: string) {
    return this.http.post(`${API}/api/admin/ads/${id}/${action}`, { reason: reason ?? null });
  }

  pendingBarcodes() { return this.http.get<PendingBarcode[]>(`${API}/api/admin/barcodes/pending`); }
  barcodeAction(id: number, action: 'confirm' | 'reject') { return this.http.post(`${API}/api/admin/barcodes/${id}/${action}`, {}); }
}
