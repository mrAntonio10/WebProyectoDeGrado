import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/home.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './app.login.component.html',
  providers: [MessageService]
})
export class AppLoginComponent implements OnInit {
  // @ts-ignore
  form: FormGroup;

  showPassword = false;
  passwordType = 'password';
  iconClass = 'pi pi-eye-slash';

  loginAgainMessage: string;


  constructor(private router: Router,
              private loginService: LoginService,
              private service: MessageService,
             ) {
  }
  ngOnInit() {

    // @ts-ignore
    this.form = new FormGroup({
      email:new FormControl('', [Validators.required, Validators.email]),
      password:new FormControl('', [Validators.required]),
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

  submitForm(){
    console.log(this.form.value)
    this.loginService.logInUser(this.form.value).subscribe({
      next:
        resp => {
          if (resp) {
            localStorage.setItem('token', resp.data.token);
            localStorage.setItem('email', resp.data.user);
            localStorage.setItem('redirect', resp.data.resourceUrl);
            this.router.navigate([resp.data.resourceUrl]);
          }
        },
      error: err => {
          console.log(err);
           this.service.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
        }
    })
  }
}
