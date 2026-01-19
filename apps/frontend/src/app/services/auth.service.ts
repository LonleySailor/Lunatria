import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private api: ApiService) { }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const data = await this.api.get<any>(API_ENDPOINTS.SESSIONS.IS_ACTIVE);
      return data.responseCode === 704;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  logout(): void {
    this.api.get<any>(API_ENDPOINTS.USERS.LOGOUT)
      .then(data => {
        if (data && data.statusCode === 200 && data.responseCode === 611) {
          window.location.reload();
        }
      })
      .catch(() => {});
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
