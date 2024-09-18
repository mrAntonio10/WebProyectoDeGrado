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
  }

  submitForm(){
    console.log(this.form.value)
    this.loginService.logInUser(this.form.value).subscribe({
      next:
        resp => {
          if (resp) {
            localStorage.setItem('token', resp.data.token);
            localStorage.setItem('email', resp.data.user);
            this.router.navigate(['/dashboard']);
          }
        },
      error: err => {
          console.log(err);
           this.service.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
        }
    })
  }
}
