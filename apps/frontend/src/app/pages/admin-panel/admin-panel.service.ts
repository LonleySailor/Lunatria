import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/constants';

@Injectable({ providedIn: 'root' })
export class AdminPanelService {

  constructor(private api: ApiService) { }

  async createUser(userData: {
    username: string;
    password: string;
    email: string;
    usertype: string;
    allowedServices: string[];
  }) {

    return this.api.post(API_ENDPOINTS.USERS.REGISTER, {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      usertype: userData.usertype,
      allowedServices: userData.allowedServices,
    });
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

    return await this.api.post<any>(API_ENDPOINTS.CREDENTIALS.ADD, payload);
  }
}