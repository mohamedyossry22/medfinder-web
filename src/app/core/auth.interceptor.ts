import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API } from './config';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.session()?.token;
  const out = token && req.url.startsWith(API) ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(out).pipe(catchError(e => {
    if (e.status === 401 && !req.url.includes('/api/auth/')) auth.logout();   // التوكن انتهى
    return throwError(() => e);
  }));
};
