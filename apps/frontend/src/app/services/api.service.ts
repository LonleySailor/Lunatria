import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : environment.apiBaseUrl + endpoint;
  }

  // Minimal wrapper around fetch; errors bubble up.
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(this.buildUrl(endpoint), {
      credentials: 'include',
      ...options,
    });

    // Try to parse JSON, otherwise return raw response.
    try {
      return await response.json();
    } catch {
      return response as any;
    }
  }

  get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...(options || {}) });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...(options || {}),
    });
  }

  delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...(options || {}) });
  }
}
