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

  async getAvailableServices() {
    return this.api.get<
      { name: string; label: string; requiresEmail: boolean; supportsAutoRegister: boolean }[]
    >(API_ENDPOINTS.ADMIN.SERVICES);
  }

  async getUsersWithoutCredential(service: string) {
    return this.api.get<{ id: string; username: string; email: string }[]>(
      `${API_ENDPOINTS.ADMIN.USERS_WITHOUT_CREDENTIAL}/${service}`,
    );
  }

  async registerCredential(payload: {
    service: string;
    targetUser: string;
    autoRegister: boolean;
    username?: string;
    password?: string;
    email?: string;
  }) {
    return await this.api.post<any>(
      API_ENDPOINTS.ADMIN.REGISTER_CREDENTIAL,
      payload,
    );
  }

  async getUsersWithoutAccess(service: string) {
    return this.api.get<
      {
        id: string;
        username: string;
        email: string;
        userType: string;
        hasCredentials: boolean;
      }[]
    >(`${API_ENDPOINTS.ADMIN.USERS_WITHOUT_ACCESS}/${service}`);
  }

  async grantAccess(payload: { service: string; targetUser: string }) {
    return await this.api.post<any>(API_ENDPOINTS.ADMIN.GRANT_ACCESS, payload);
  }

  async getUsersWithAccess(service: string) {
    return this.api.get<
      {
        id: string;
        username: string;
        email: string;
        userType: string;
        hasCredentials: boolean;
      }[]
    >(`${API_ENDPOINTS.ADMIN.USERS_WITH_ACCESS}/${service}`);
  }

  async revokeAccess(payload: { service: string; targetUser: string }) {
    return await this.api.post<any>(API_ENDPOINTS.ADMIN.REVOKE_ACCESS, payload);
  }

  async getUsersWithCredential(service: string) {
    return this.api.get<{ id: string; username: string; email: string }[]>(
      `${API_ENDPOINTS.ADMIN.USERS_WITH_CREDENTIAL}/${service}`,
    );
  }

  async revokeCredential(payload: { service: string; targetUser: string }) {
    return await this.api.post<any>(
      API_ENDPOINTS.ADMIN.REVOKE_CREDENTIAL,
      payload,
    );
  }

  async getUsers() {
    return this.api.get<
      { id: string; username: string; email: string; userType: string }[]
    >(API_ENDPOINTS.ADMIN.USERS);
  }

  async deleteUser(payload: { targetUser: string }) {
    return await this.api.post<any>(API_ENDPOINTS.ADMIN.DELETE_USER, payload);
  }
}