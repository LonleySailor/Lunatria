import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiBaseUrl}/sessions/issessionactive`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.responseCode === 704;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  logout(): void {
    fetch(`${environment.apiBaseUrl}/users/logout`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.statusCode === 200 && data.responseCode === 611) {
          window.location.reload();
        } else {
          console.log('Logout failed');
        }
      })
      .catch(error => console.error('Logout error:', error));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  async isUserAdmin(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiBaseUrl}/support/is-admin`, {
        credentials: 'include',
      }).then(response => response.json());
      console.log(response);
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
