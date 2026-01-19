import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const translate = inject(TranslateService);

  try {
    const loggedIn = await authService.isUserLoggedIn();
    if (!loggedIn) {
      toastr.error(translate.instant('Toast.Unauthorized'), translate.instant('Toast.Error'));
      router.navigate(['/login']);
    }
    return loggedIn;
  } catch (err) {
    toastr.error(translate.instant('Toast.Unauthorized'), translate.instant('Toast.Error'));
    router.navigate(['/login']);
    return false;
  }
};
