import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // ✅ Required for *ngIf
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackgroundComponent } from '../../components/background/background.component';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/constants';
import { environment } from '../../../environments/environment';


function buildServiceUrl(subdomain: string, path: string): string {
  const base = new URL(environment.apiBaseUrl);
  const rootHost = base.hostname.replace(/^api\./, '');
  const port = base.port ? `:${base.port}` : '';
  return `${base.protocol}//${subdomain}.${rootHost}${port}${path}`;
}

@Component({
    selector: 'app-logout',
    standalone: true,
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css'],
    imports: [NgIf, FooterComponent, BackgroundComponent], 
})
export class LogoutComponent implements OnInit {
    step:
        | 'radarr-main'
        | 'radarr-cleanup'
        | 'sonarr-main'
        | 'sonarr-cleanup'
        | 'done' = 'radarr-main';

    services = new Set(['jellyfin', 'radarr', 'sonarr']);
    completed = new Set<string>();
    private finished = false;

    // Debugging reasons / origins
    reason: 'all' | 'jellyfin' | 'unknown' = 'unknown';
    source: string = '';

   
    radarrLogoutUrl!: SafeResourceUrl;
    radarrCleanupUrl!: SafeResourceUrl;
    sonarrLogoutUrl!: SafeResourceUrl;
    sonarrCleanupUrl!: SafeResourceUrl;
    jellyfinLogoutUrl!: SafeResourceUrl;

    constructor(private api: ApiService, private sanitizer: DomSanitizer, private router: Router) {
        const trust = (u: string) => this.sanitizer.bypassSecurityTrustResourceUrl(u);
        this.radarrLogoutUrl = trust(buildServiceUrl('radarr', '/logout'));
        this.radarrCleanupUrl = trust(`${environment.apiBaseUrl}/users/logout-radarr`);
        this.sonarrLogoutUrl = trust(buildServiceUrl('sonarr', '/logout'));
        this.sonarrCleanupUrl = trust(`${environment.apiBaseUrl}/users/logout-sonarr`);
        this.jellyfinLogoutUrl = trust(buildServiceUrl('jellyfin', '/jellyfin-logout'));
    }

    ngOnInit(): void {
        window.addEventListener('message', this.onMessage.bind(this));

            setTimeout(() => this.finishLogout(), 8000);
    }

    onRadarrMainDone() {
        console.log('✅ Radarr main logout complete');
        this.step = 'radarr-cleanup';
    }

    onSonarrMainDone() {
        console.log('✅ Sonarr main logout complete');
        this.step = 'sonarr-cleanup';
    }

    async onIframeLoaded(service: string) {
        console.log(`✅ ${service} iframe finished`);
        this.completed.add(service);

        // Step progression logic for Radarr and Sonarr cleanup
        if (service === 'radarr' && this.step === 'radarr-cleanup') {
            this.step = 'sonarr-main';
        } else if (service === 'sonarr' && this.step === 'sonarr-cleanup') {
            this.step = 'done';
        }

        // Once every per-service logout is done, destroy the main session LAST.
        if (this.completed.size === this.services.size) {
            await this.finishLogout();
        }
    }
    private async finishLogout(): Promise<void> {
        if (this.finished) return;
        this.finished = true;

        try {
            await this.api.get<any>(API_ENDPOINTS.USERS.LOGOUT);
        } catch (err) {
            console.error('Session logout request failed:', err);
        }

        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = '✅ Logged out of all services!';
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.router.navigate(['/login']);
    }

    onMessage(event: MessageEvent) {
        // Optional postMessage handling (if used)
        const { data } = event;
        if (data === 'radarr-cleanup-done') {
            this.onIframeLoaded('radarr');
        } else if (data === 'sonarr-cleanup-done') {
            this.onIframeLoaded('sonarr');
        } else if (data === 'jellyfin-cleanup-done') {
            this.onIframeLoaded('jellyfin');
        }
    }
}
