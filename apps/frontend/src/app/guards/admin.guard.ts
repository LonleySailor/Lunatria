import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastr = inject(ToastrService);

    try {
        const isUserAdmin = await authService.isUserAdmin();
        if (!isUserAdmin) {
            toastr.error('You must be a admin to access this page.', 'Unauthorized');
            router.navigate(['/home']);
        }
        return isUserAdmin;
    } catch (err) {
        toastr.error('You must be logged in to access this page.', 'Unauthorized');
        router.navigate(['/home']);
        return false;
    }
};
