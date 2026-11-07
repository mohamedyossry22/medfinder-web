import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './config';
import {
  AdminPharmacy, AdminPharmacyRow, IncomingRequest, Paged, PharmacyMe, PharmacyStatus,
  ReadyItem, RequestDetail, Stats
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
}
