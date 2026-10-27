import {
  HttpBackend,
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

const JA_REPETIDA = new HttpContextToken<boolean>(() => false);
const PUBLICAS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function urlDoRefresh(req: HttpRequest<unknown>): string {
  try {
    const url = new URL(req.url, window.location.origin);
    return `${url.origin}/auth/refresh`;
  } catch {
    return '/auth/refresh';
  }
}

let renovando = false;
const resultado$ = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const httpDireto = new HttpClient(inject(HttpBackend));

  const comCookies = req.clone({ withCredentials: true });

  return next(comCookies).pipe(
    catchError((erro: HttpErrorResponse) => {
      const naoSeAplica =
        erro.status !== 401 ||
        comCookies.context.get(JA_REPETIDA) ||
        PUBLICAS.some((rota) => comCookies.url.includes(rota));

      if (naoSeAplica) return throwError(() => erro);

      if (renovando) {
        return resultado$.pipe(
          filter((r) => r !== null),
          take(1),
          switchMap((ok) =>
            ok
              ? next(marcarRepetida(comCookies))
              : throwError(() => erro),
          ),
        );
      }

      renovando = true;
      resultado$.next(null);

      return httpDireto
        .post(urlDoRefresh(comCookies), {}, { withCredentials: true })
        .pipe(
          switchMap(() => {
            renovando = false;
            resultado$.next(true);

            return next(marcarRepetida(comCookies));
          }),
          catchError((erroRefresh: HttpErrorResponse) => {
            renovando = false;
            resultado$.next(false);

            console.error('[auth] refresh falhou', {
              status: erroRefresh.status,
              url: erroRefresh.url,
              body: erroRefresh.error,
            });

            router.navigate(['/login']);
            return throwError(() => erroRefresh);
          }),
        );
    }),
  );
};

function marcarRepetida<T>(req: HttpRequest<T>): HttpRequest<T> {
  return req.clone({ context: req.context.set(JA_REPETIDA, true) });
}