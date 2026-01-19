import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http')
      ? endpoint
      : `${environment.apiBaseUrl}${endpoint}`;
  }

  async request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': options.body instanceof FormData ? undefined as unknown as string : 'application/json',
        ...(options.headers || {})
      },
      ...options,
    } as RequestInit);

    if (!response.ok) {
      const error = new Error(`HTTP error ${response.status}`);
      throw error;
    }

    // Some endpoints might not return JSON (e.g., 204)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return null as T;
  }

  get<T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...(options || {}) });
  }

  post<T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    const payload = body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined;
    return this.request<T>(endpoint, { method: 'POST', body: payload as BodyInit, ...(options || {}) });
  }

  delete<T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...(options || {}) });
  }
}
