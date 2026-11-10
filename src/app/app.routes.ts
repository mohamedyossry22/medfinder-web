import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
  { path: 'privacy', data: { kind: 'privacy' }, loadComponent: () => import('./landing/legal.component').then(m => m.LegalComponent) },
  { path: 'terms', data: { kind: 'terms' }, loadComponent: () => import('./landing/legal.component').then(m => m.LegalComponent) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
  {
    path: 'pharmacy',
    canActivate: [roleGuard('Pharmacy')],
    loadComponent: () => import('./pharmacy/pharmacy-layout.component').then(m => m.PharmacyLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'incoming' },
      { path: 'incoming', loadComponent: () => import('./pharmacy/incoming.component').then(m => m.IncomingComponent) },
      { path: 'ready', loadComponent: () => import('./pharmacy/ready.component').then(m => m.ReadyComponent) },
      { path: 'requests/:id', loadComponent: () => import('./pharmacy/request-details.component').then(m => m.RequestDetailsComponent) },
      { path: 'history', loadComponent: () => import('./pharmacy/history.component').then(m => m.HistoryComponent) },
      { path: 'profile', loadComponent: () => import('./pharmacy/profile.component').then(m => m.ProfileComponent) },
      { path: 'ads', loadComponent: () => import('./pharmacy/ads.component').then(m => m.AdsComponent) }
    ]
  },
  {
    path: 'admin',
    canActivate: [roleGuard('Admin')],
    loadComponent: () => import('./admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'pharmacies', loadComponent: () => import('./admin/pharmacies.component').then(m => m.PharmaciesComponent) },
      { path: 'pharmacies/:id', loadComponent: () => import('./admin/pharmacy-detail.component').then(m => m.PharmacyDetailComponent) },
      { path: 'users', loadComponent: () => import('./admin/users.component').then(m => m.UsersComponent) },
      { path: 'ads', loadComponent: () => import('./admin/ads.component').then(m => m.AdminAdsComponent) },
      { path: 'barcodes', loadComponent: () => import('./admin/barcodes.component').then(m => m.BarcodesComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];