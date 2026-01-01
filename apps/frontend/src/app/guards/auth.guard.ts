import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  try {
    const loggedIn = await authService.isUserLoggedIn();
    if (!loggedIn) {
      toastr.error('You must be logged in to access this page.', 'Unauthorized');
      router.navigate(['/login']);
    }
    return loggedIn;
  } catch (err) {
    toastr.error('You must be logged in to access this page.', 'Unauthorized');
    router.navigate(['/login']);
    return false;
  }
};
