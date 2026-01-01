import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 404:
          router.navigate(['/404']);
          break;

        case 500:
          toastr.error('A server error occurred. Please try again later.', 'Server Error');
          break;

        // 400, 403, 401 — intentionally ignored or handled elsewhere
      }

      return throwError(() => error);
    })
  );
};
