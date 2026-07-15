import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { UserService } from '../services/users/users.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private refreshing = false;
  private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authReq = req.clone({ withCredentials: true });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          // Se já está atualizando, espera a atualização terminar
          if (this.refreshing) {
            return this.refreshSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(() => {
                const retryReq = req.clone({ withCredentials: true });
                return next.handle(retryReq);
              })
            );
          }

          // Caso contrário, inicia o processo de refresh
          this.refreshing = true;
          this.refreshSubject.next(null);

          return this.userService.refresh().pipe(
            switchMap(() => {
              this.refreshing = false;
              this.refreshSubject.next(true);

              const retryReq = req.clone({ withCredentials: true });
              return next.handle(retryReq);
            }),
            catchError(refreshErr => {
              this.refreshing = false;
              return throwError(() => refreshErr);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
