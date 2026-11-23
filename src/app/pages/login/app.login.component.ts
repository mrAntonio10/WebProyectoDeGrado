import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/home.service';
import { MessageService } from 'primeng/api';
import { REKIDS_LOGIN_CONFIG } from './config';

@Component({
  selector: 'app-login',
  templateUrl: './app.login.component.html',
  providers: [MessageService]
})
export class AppLoginComponent implements OnInit {
  form: FormGroup;
  config = REKIDS_LOGIN_CONFIG;

  showPassword = false;
  passwordType = 'password';
  iconClass = 'pi pi-eye-slash';

  loginAgainMessage: string;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private service: MessageService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });

    this.loginAgainMessage = localStorage.getItem('error-login-again') ?? '';
    if (!!this.loginAgainMessage) {
      setTimeout(() => {
        this.loginAgainErrorMessage();
      }, 100);
    }
  }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
    this.iconClass = this.showPassword ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  private loginAgainErrorMessage() {
    this.service.add({ severity: 'error', summary: 'Error', detail: this.loginAgainMessage });
    localStorage.removeItem('error-login-again');
  }

  goToPublicStore() {
    this.router.navigate([this.config.publicStoreUrl]);
  }

  goToAboutUs() {
    this.router.navigate([this.config.aboutUsUrl || '/dashboard/comercial-management/about-us']);
  }

  submitForm() {
    const emailInput = (this.form.value.email || '').trim().toLowerCase();
    const passwordInput = this.form.value.password || '';

    this.loginService.logInUser(this.form.value).subscribe({
      next: (resp) => {
        if (resp?.data) {
          localStorage.setItem('token', resp.data.token);
          localStorage.setItem('email', resp.data.user);
          localStorage.setItem('redirect', this.config.adminRedirectUrl);
          this.router.navigate([this.config.adminRedirectUrl]);
        }
      },
      error: (err) => {
        // Si el backend respondió con error explícito (401/403)
        if (err?.status === 401 || err?.status === 403) {
          this.service.add({
            severity: 'error',
            summary: 'Acceso Restringido',
            detail: err?.error?.data?.response || 'Solo los administradores pueden iniciar sesión en el sistema Rekids.'
          });
          return;
        }

        // Fallback mock de config.ts cuando el backend está offline:
        // SOLO permite login a cuentas ADMIN
        const matchedAdmin = this.config.allowedAdminAccounts.find(
          a => a.email.toLowerCase() === emailInput && a.password === passwordInput
        );

        if (matchedAdmin) {
          localStorage.setItem('token', 'mock-rekids-admin-jwt-' + Date.now());
          localStorage.setItem('email', matchedAdmin.email);
          localStorage.setItem('redirect', this.config.adminRedirectUrl);
          this.router.navigate([this.config.adminRedirectUrl]);
        } else {
          this.service.add({
            severity: 'error',
            summary: 'Acceso Denegado',
            detail: 'Solo los administradores autorizados (ej. admin@gmail.com) pueden iniciar sesión en el portal Rekids.'
          });
        }
      }
    });
  }
}
