import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from './config';
import { AuthResponse, PharmacyStatus, Role } from './models';

const KEY = 'mf_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _session = signal<AuthResponse | null>(this.load());
  readonly session = this._session.asReadonly();
  readonly role = computed<Role | null>(() => this._session()?.role ?? null);

  private load(): AuthResponse | null {
    try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  }
  private save(s: AuthResponse | null) {
    this._session.set(s);
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* ignore */ }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API}/api/auth/login`, { email, password }).pipe(tap(r => this.save(r)));
  }
  register(form: FormData) { return this.http.post(`${API}/api/auth/pharmacy/register`, form); }

  setPharmacyStatus(status: PharmacyStatus) {
    const s = this._session();
    if (s) this.save({ ...s, pharmacyStatus: status });
  }

  homeFor(role: Role | null): string { return role === 'Admin' ? '/admin' : role === 'Pharmacy' ? '/pharmacy' : '/login'; }

  logout() {
    this.save(null);
    this.router.navigate(['/login']);
  }
}
