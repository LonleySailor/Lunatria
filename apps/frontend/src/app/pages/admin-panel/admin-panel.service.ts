import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminPanelService {

  constructor(private http: HttpClient) { }

  async createUser(userData: {
    username: string;
    password: string;
    email: string;
    usertype: string;
    allowedServices: string[];
  }) {

    return fetch(`${environment.apiBaseUrl}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        usertype: userData.usertype,
        allowedServices: userData.allowedServices,
      })
    })
      .then(response => response.json());
  }

  async addCredentials(credentialsData: {
    service: string;
    username?: string;
    password: string;
    email?: string;
    targetUser: string;
  }) {
    const payload: any = {
      service: credentialsData.service,
      password: credentialsData.password,
      targetUser: credentialsData.targetUser,
    };

    if (credentialsData.username) {
      payload.username = credentialsData.username;
    }

    if (credentialsData.email) {
      payload.email = credentialsData.email;
    }

    return await fetch(`${environment.apiBaseUrl}/credentials/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(response => response.json());
  }
}