import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { adminGuard } from './guards/admin.guard';
import { LogoutComponent } from './pages/logout/logout.component';
import { UsersProfileComponent } from './pages/users-profile/users-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'users-profile', component: UsersProfileComponent, canActivate: [authGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [adminGuard] },
  { path: 'logout', component: LogoutComponent },
  { path: '**', component: NotFoundComponent },
];
