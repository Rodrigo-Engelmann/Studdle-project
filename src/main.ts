import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { AuthInitService } from './app/services/auth/auth-init.service';
import { APP_INITIALIZER, inject } from '@angular/core';

export function initAuth() {
  const authInit = inject(AuthInitService);
  return () => authInit.restoreSession();
}

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(),
    AuthInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true
    }
  ],
}).catch((err) => console.error(err));
