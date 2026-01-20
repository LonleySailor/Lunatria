import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/constants';

type ServiceName = 'hoarder' | 'nextcloud' | 'vaultwarden' | 'jellyfin' | 'radarr' | 'sonarr' | 'komga';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly apiUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.SUPPORT.SERVICES}`;
  private lastKnownStatuses = new BehaviorSubject<Record<ServiceName, boolean>>({
    hoarder: false,
    nextcloud: false,
    vaultwarden: false,
    jellyfin: false,
    radarr: false,
    sonarr: false,
    komga: false
  });

  constructor(private api: ApiService) { }

  getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
    return from(this.api.get<Record<ServiceName, boolean>>(API_ENDPOINTS.SUPPORT.SERVICES)).pipe(
      tap((statuses) => this.lastKnownStatuses.next(statuses)),
      catchError(() => of(this.lastKnownStatuses.value))
    );
  }
} 