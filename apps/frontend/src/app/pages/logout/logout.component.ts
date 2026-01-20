import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // ✅ Required for *ngIf
import { FooterComponent } from '../../components/footer/footer.component';
import { BackgroundComponent } from '../../components/background/background.component';
import { ApiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/constants';
import { RESPONSE_CODES } from '../../config/response-codes.const';

@Component({
    selector: 'app-logout',
    standalone: true,
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css'],
    imports: [NgIf, FooterComponent, BackgroundComponent], // ✅ add NgIf
})
export class LogoutComponent implements OnInit {
    // Extended step logic for Radarr and Sonarr
    step:
        | 'radarr-main'
        | 'radarr-cleanup'
        | 'sonarr-main'
        | 'sonarr-cleanup'
        | 'done' = 'radarr-main';

    // Tracking progress: added 'sonarr' service
    services = new Set(['jellyfin', 'radarr', 'sonarr', 'general']);
    completed = new Set<string>();

    // Debugging reasons / origins
    reason: 'all' | 'jellyfin' | 'unknown' = 'unknown';
    source: string = '';

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        // Listen for any messages from iframes (if needed)
        window.addEventListener('message', this.onMessage.bind(this));

        // Wait for 2 seconds before executing main logout API call
        setTimeout(() => {
            this.api.get<any>(API_ENDPOINTS.USERS.LOGOUT)
                .then((data) => {
                    if (!(data && data.statusCode === 200 && data.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_OUT_SUCCESSFULLY)) {
                        throw new Error('Logout failed');
                    }
                })
                .catch((err) => {
                    console.error('Logout failed:', err);
                });
            this.onIframeLoaded('general');
        }, 2000);
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

        // If all services finished, show success message
        if (this.completed.size === this.services.size) {
            const statusEl = document.getElementById('status');
            if (statusEl) statusEl.textContent = '✅ Logged out of all services!';
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
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
