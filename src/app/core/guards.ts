import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard = (role: Role): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.role() === role ? true : inject(Router).createUrlTree(['/login']);
};

/** صفحات الدخول والتسجيل: لو المستخدم داخل بالفعل نوديه لصفحته */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const role = auth.role();
  return role ? inject(Router).createUrlTree([auth.homeFor(role)]) : true;
};

export const homeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return inject(Router).createUrlTree([auth.homeFor(auth.role())]);
};
