import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export const adminGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastr = inject(ToastrService);
    const translate = inject(TranslateService);

    try {
        const isUserAdmin = await authService.isUserAdmin();
        if (!isUserAdmin) {
            toastr.error(translate.instant('Toast.AdminOnly'), translate.instant('Toast.Error'));
            router.navigate(['/home']);
        }
        return isUserAdmin;
    } catch (err) {
        toastr.error(translate.instant('Toast.Unauthorized'), translate.instant('Toast.Error'));
        router.navigate(['/home']);
        return false;
    }
};
