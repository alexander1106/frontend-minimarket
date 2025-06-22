import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptorProviders } from './service/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi()  // <- Aquí decimos que usaremos interceptores DI como clases
    ),
    ...authInterceptorProviders, // <- Tu clase interceptor registrada como provider
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
