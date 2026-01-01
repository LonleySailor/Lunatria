import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

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


  constructor(private router: Router, private authService: AuthService) { }
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
    fetch(`${environment.apiBaseUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.responseCode === 609) {
          // Login successful
          console.log('Logged in as:', data.User);
          this.router.navigate(['/home']);
        } else if (data.responseCode === 603) {
          // Incorrect password
          console.log('Incorrect password');
          alert('Incorrect password');
        } else if (data.responseCode === 602) {
          // Incorrect username
          console.log('Incorrect username');
          alert('Incorrect username');
        } else {
          console.log('Unknown response code:', data.responseCode);
        }
      })
      .catch(error => console.error('Error:', error));
  }
  logout(): void {
    fetch(`${environment.apiBaseUrl}/users/logout`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) throw new Error('Logout failed');
        return null;  // no JSON expected
      })
      .then(() => window.location.reload())
      .catch(err => {
        console.error('Logout failed', err);
      });
  }

}
