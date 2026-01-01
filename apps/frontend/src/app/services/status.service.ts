import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

type ServiceName = 'hoarder' | 'nextcloud' | 'vaultwarden' | 'jellyfin' | 'radarr' | 'sonarr' | 'komga';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly apiUrl = `${environment.apiBaseUrl}/support/services`;
  private lastKnownStatuses = new BehaviorSubject<Record<ServiceName, boolean>>({
    hoarder: false,
    nextcloud: false,
    vaultwarden: false,
    jellyfin: false,
    radarr: false,
    sonarr: false,
    komga: false
  });

  constructor(private http: HttpClient) { }

  getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
    return this.http.get<Record<ServiceName, boolean>>(this.apiUrl).pipe(
      tap(statuses => {
        this.lastKnownStatuses.next(statuses);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching service statuses:', error.message);
        console.log('Returning last known statuses:', this.lastKnownStatuses.value);
        return of(this.lastKnownStatuses.value);
      })
    );
  }
} 