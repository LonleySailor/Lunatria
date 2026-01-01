import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';



@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css'],
  imports: [NgIf, BackgroundComponent, FooterComponent,],

})
export class UnauthorizedComponent implements OnInit {
  reason: 'notLoggedIn' | 'noAccess' | 'unknown' = 'unknown';
  source: string = '';

  constructor(private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.source = this.route.snapshot.queryParamMap.get('source') ?? '';

    if (!this.source) {
      this.reason = 'unknown';
      return;
    }

    fetch(`${environment.apiBaseUrl}/support/service-access?service=${this.source}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.responseCode === 702) {
          this.reason = 'notLoggedIn'
        }
        if (data.access === false) {
          this.reason = 'noAccess'
        }
        if (data.access === true) {
          this.reason = 'unknown'
        }
      })
      .catch(() => {
        this.reason = 'unknown';
      });
  }
  loginRedirect() {
    window.location.href = '/login';
  }

}
