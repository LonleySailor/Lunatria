import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-profile-circle',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './user-profile-circle.component.html',
  styleUrls: ['./user-profile-circle.component.css']
})
export class UserProfileCircleComponent implements OnInit, OnDestroy {
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userProfile: UserProfile | null = null;
  isDropdownOpen = false;
  profileImageError = false;

  private documentClickListener?: (event: Event) => void;

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupDocumentClickListener();
  }

  ngOnDestroy(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  async loadUserProfile(): Promise<void> {
    this.userProfile = await this.userProfileService.getUserInfo();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateToProfile(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/users-profile']);
  }

  navigateToHome(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.userProfile?.username) return '?';
    return this.userProfile.username.charAt(0).toUpperCase();
  }

  onImageError(): void {
    this.profileImageError = true;
  }

  onImageLoad(): void {
    this.profileImageError = false;
  }

  private setupDocumentClickListener(): void {
    this.documentClickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      const profileCircle = document.querySelector('.profile-circle-container');
      
      if (profileCircle && !profileCircle.contains(target)) {
        this.isDropdownOpen = false;
      }
    };
    
    document.addEventListener('click', this.documentClickListener);
  }
}
