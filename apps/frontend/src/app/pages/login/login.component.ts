import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/constants';
import { RESPONSE_CODES } from '../../config/response-codes.const';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, BackgroundComponent, FooterComponent, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  isSessionActive = false;
  isSubmitting = false;


  constructor(private router: Router, private authService: AuthService, private toastr: ToastrService, private translate: TranslateService, private api: ApiService) { }
  ngOnInit(): void {
    this.checkSessionStatus();
  }

  async checkSessionStatus(): Promise<void> {
    this.isSessionActive = await this.authService.isUserLoggedIn();
  }


  continueWithExistingSession(): void {
    this.router.navigate(['/home']);
  }
  onSubmit() {
    this.isSubmitting = true;
    this.api.post<any>(API_ENDPOINTS.USERS.LOGIN, { username: this.username, password: this.password })
      .then(data => {
        if (data.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_IN) {
          // Login successful
          this.router.navigate(['/home']);
        } else if (data.responseCode === RESPONSE_CODES.AUTH.INCORRECT_PASSWORD) {
          // Incorrect password
          this.toastr.error(this.translate.instant('AUTH.IncorrectPassword'), this.translate.instant('Toast.Error'));
        } else if (data.responseCode === RESPONSE_CODES.AUTH.INCORRECT_EMAIL) {
          // Incorrect username
          this.toastr.error(this.translate.instant('AUTH.IncorrectUsername'), this.translate.instant('Toast.Error'));
        } else {
          this.toastr.error(this.translate.instant('AUTH.UnknownResponse'), this.translate.instant('Toast.Error'));
        }
      })
      .catch(() => {
        this.toastr.error(this.translate.instant('Toast.Unauthorized'), this.translate.instant('Toast.Error'));
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }
  logout(): void {
    this.authService.logout();
  }

}
