import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/constants';
import { RESPONSE_CODES } from '../config/response-codes.const';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private api: ApiService, private router: Router) { }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const data = await this.api.get<any>(API_ENDPOINTS.SESSIONS.IS_ACTIVE);
      return data.responseCode === RESPONSE_CODES.SESSIONS.SESSION_STATUS_FETCHED_SUCCESSFULLY;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const data = await this.api.get<any>(API_ENDPOINTS.USERS.LOGOUT);
      const isSuccess = data && data.statusCode === 200 && data.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_OUT_SUCCESSFULLY;

      if (!isSuccess) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always take the user back to the login screen so they can re-authenticate.
      this.router.navigate(['/login']);
    }
  }

  async isUserAdmin(): Promise<boolean> {
    try {
      const response = await this.api.get<{ isAdmin: boolean }>(API_ENDPOINTS.SUPPORT.IS_ADMIN);
      if (response.isAdmin === false) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}
