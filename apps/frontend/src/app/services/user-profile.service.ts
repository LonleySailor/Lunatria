import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../config/constants';
import { ApiService } from './api.service';

export interface UserProfile {
  username: string;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private api: ApiService) { }

  async getUserInfo(): Promise<UserProfile | null> {
    try {
      const data = await this.api.get<any>(API_ENDPOINTS.SESSIONS.GET_USER_INFO);
      if (data && data.responseCode === 705) {
        return {
          username: data.username,
          profilePictureUrl: this.getProfilePictureUrl(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  getProfilePictureUrl(): string {
    return `${environment.apiBaseUrl}${API_ENDPOINTS.USERS.PROFILE_PICTURE}`;
  }

  async uploadProfilePicture(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const data = await this.api.request(API_ENDPOINTS.USERS.PROFILE_PICTURE, {
        method: 'POST',
        body: formData,
      });

      if (data.responseCode === 625) {
        return { success: true, message: 'Profile picture uploaded successfully' };
      } else {
        return { success: false, message: this.getErrorMessage(data.responseCode) };
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  async deleteProfilePicture(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await this.api.delete<any>(API_ENDPOINTS.USERS.PROFILE_PICTURE);

      if (data.responseCode === 626) {
        return { success: true, message: 'Profile picture deleted successfully' };
      } else {
        return { success: false, message: this.getErrorMessage(data.responseCode) };
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }

  private getErrorMessage(responseCode: number): string {
    const errorMessages: { [key: number]: string } = {
      620: 'Profile picture is required',
      621: 'Invalid file type. Please use JPG, PNG, GIF, or WebP',
      622: 'File is too large. Maximum size is 5MB',
      623: 'Profile picture upload failed',
      624: 'No profile picture found',
      610: 'User not found',
      618: 'Admin access required'
    };

    return errorMessages[responseCode] || 'Unknown error occurred';
  }
}
