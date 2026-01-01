import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserProfileCircleComponent } from '../../components/user-profile-circle/user-profile-circle.component';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';

@Component({
  selector: 'app-users-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    BackgroundComponent,
    FooterComponent,
    UserProfileCircleComponent
  ],
  templateUrl: './users-profile.component.html',
  styleUrls: ['./users-profile.component.css']
})
export class UsersProfileComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private toastr = inject(ToastrService);

  userProfile: UserProfile | null = null;
  selectedSection = 'general';
  profileImageError = false;
  isUploading = false;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  async loadUserProfile(): Promise<void> {
    this.userProfile = await this.userProfileService.getUserInfo();
    if (!this.userProfile) {
      this.toastr.error('Failed to load user profile', 'Error');
    }
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadProfilePicture(file);
    }
  }

  async uploadProfilePicture(file: File): Promise<void> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Invalid file type. Please use JPG, PNG, GIF, or WebP', 'Error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File is too large. Maximum size is 5MB', 'Error');
      return;
    }

    this.isUploading = true;
    
    try {
      const result = await this.userProfileService.uploadProfilePicture(file);
      
      if (result.success) {
        this.toastr.success(result.message, 'Success');
        // Reload profile to get updated image
        await this.loadUserProfile();
        this.profileImageError = false;
      } else {
        this.toastr.error(result.message, 'Error');
      }
    } catch (error) {
      this.toastr.error('An unexpected error occurred', 'Error');
    } finally {
      this.isUploading = false;
    }
  }

  async deleteProfilePicture(): Promise<void> {
    if (confirm('Are you sure you want to delete your profile picture?')) {
      try {
        const result = await this.userProfileService.deleteProfilePicture();
        
        if (result.success) {
          this.toastr.success(result.message, 'Success');
          // Reload profile to remove image
          await this.loadUserProfile();
          this.profileImageError = true;
        } else {
          this.toastr.error(result.message, 'Error');
        }
      } catch (error) {
        this.toastr.error('An unexpected error occurred', 'Error');
      }
    }
  }

  onImageError(): void {
    this.profileImageError = true;
  }

  onImageLoad(): void {
    this.profileImageError = false;
  }

  getInitials(): string {
    if (!this.userProfile?.username) return '?';
    return this.userProfile.username.charAt(0).toUpperCase();
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
    fileInput?.click();
  }
}
