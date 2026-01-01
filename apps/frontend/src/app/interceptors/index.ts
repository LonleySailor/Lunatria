import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { errorInterceptor } from './http-error.interceptor';

export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: errorInterceptor,
    multi: true
  }
];
