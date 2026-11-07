import { Routes } from "@angular/router";
import { guestGuard, homeGuard, roleGuard } from "./core/guards";

export const routes: Routes = [
  { path: "", pathMatch: "full", canActivate: [homeGuard], children: [] },
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./auth/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./auth/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "pharmacy",
    //canActivate: [roleGuard('Pharmacy')],
    loadComponent: () =>
      import("./pharmacy/pharmacy-layout.component").then(
        (m) => m.PharmacyLayoutComponent,
      ),
    children: [
      { path: "", pathMatch: "full", redirectTo: "incoming" },
      {
        path: "incoming",
        loadComponent: () =>
          import("./pharmacy/incoming.component").then(
            (m) => m.IncomingComponent,
          ),
      },
      {
        path: "ready",
        loadComponent: () =>
          import("./pharmacy/ready.component").then((m) => m.ReadyComponent),
      },
      {
        path: "requests/:id",
        loadComponent: () =>
          import("./pharmacy/request-details.component").then(
            (m) => m.RequestDetailsComponent,
          ),
      },
    ],
  },
  {
    path: "admin",
    canActivate: [roleGuard("Admin")],
    loadComponent: () =>
      import("./admin/admin-layout.component").then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./admin/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: "pharmacies",
        loadComponent: () =>
          import("./admin/pharmacies.component").then(
            (m) => m.PharmaciesComponent,
          ),
      },
      {
        path: "pharmacies/:id",
        loadComponent: () =>
          import("./admin/pharmacy-detail.component").then(
            (m) => m.PharmacyDetailComponent,
          ),
      },
    ],
  },
  { path: "**", redirectTo: "" },
];
