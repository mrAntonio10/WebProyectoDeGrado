import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginAgainComponent } from '../pages/login/login-again/login-again.component';
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderService } from './loader.service';


@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  private dialogShown: boolean = false;

  private totalRequests = 0;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private loadingService: LoaderService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('caught')
    this.totalRequests++;
    this.loadingService.setLoading(true);
  
    const token: string = localStorage.getItem('token');

    const error_login_again = localStorage.getItem('error-login-again') ?? '';

    let request = req;

    if (token) {
      request = req.clone({
        setHeaders: {
          authorization: `Bearer ${ token }`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 401) {
          this.router.navigateByUrl('/home');
          console.log("Login error: " + err.error.data.response);
        }
        if (err.status === 403) {
          console.log("jwt expired: ");

          if(!this.dialogShown) {
            const ref = this.dialogService.open(LoginAgainComponent, {
              header: 'Login',
              width: '70%',
            });

            this.dialogShown = true;

            ref.onClose.subscribe(() => {
              this.dialogShown = false;
            });

          }
        }
      
        return throwError( err );

      }),

      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests == 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }

}