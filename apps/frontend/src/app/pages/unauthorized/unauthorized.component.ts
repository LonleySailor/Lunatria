import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/constants';


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

  constructor(private route: ActivatedRoute, private api: ApiService) { }
  ngOnInit(): void {
    this.source = this.route.snapshot.queryParamMap.get('source') ?? '';

    if (!this.source) {
      this.reason = 'unknown';
      return;
    }

    this.api.get<any>(`${API_ENDPOINTS.SUPPORT.BASE}/service-access?service=${this.source}`)
      .then(data => {
        if (data.responseCode === 702) {
          this.reason = 'notLoggedIn';
        } else if (data.access === false) {
          this.reason = 'noAccess';
        } else if (data.access === true) {
          this.reason = 'unknown';
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
