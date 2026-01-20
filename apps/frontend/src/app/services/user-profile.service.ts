import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../config/constants';
import { ApiService } from './api.service';
import { RESPONSE_CODES } from '../config/response-codes.const';

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
      if (data && data.responseCode === RESPONSE_CODES.SESSIONS.USER_INFO_FETCHED_SUCCESSFULLY) {
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

      if (data.responseCode === RESPONSE_CODES.PROFILE.PROFILE_PICTURE_UPLOADED_SUCCESSFULLY) {
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

      if (data.responseCode === RESPONSE_CODES.PROFILE.PROFILE_PICTURE_DELETED_SUCCESSFULLY) {
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
      [RESPONSE_CODES.PROFILE.PROFILE_PICTURE_REQUIRED]: 'Profile picture is required',
      [RESPONSE_CODES.PROFILE.INVALID_FILE_TYPE]: 'Invalid file type. Please use JPG, PNG, GIF, or WebP',
      [RESPONSE_CODES.PROFILE.FILE_TOO_LARGE]: 'File is too large. Maximum size is 5MB',
      [RESPONSE_CODES.PROFILE.PROFILE_PICTURE_UPLOAD_FAILED]: 'Profile picture upload failed',
      [RESPONSE_CODES.PROFILE.NO_PROFILE_PICTURE_FOUND]: 'No profile picture found',
      [RESPONSE_CODES.AUTH.USER_NOT_FOUND]: 'User not found',
      [RESPONSE_CODES.AUTH.ONLY_FOR_ADMIN]: 'Admin access required'
    };

    return errorMessages[responseCode] || 'Unknown error occurred';
  }
}
