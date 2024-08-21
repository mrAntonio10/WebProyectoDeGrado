import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/home.service';

@Component({
  selector: 'app-login',
  templateUrl: './app.login.component.html',
})
export class AppLoginComponent implements OnInit {
  // @ts-ignore
  form: FormGroup;

  constructor(private router: Router,
              private loginService: LoginService,
             ) {
  }
  ngOnInit() {

    // @ts-ignore
    this.form = new FormGroup({
      email:new FormControl('', [Validators.required]),
      password:new FormControl('', [Validators.required]),
    });
  }

  submitForm(){
    console.log(this.form.value)
    this.loginService.logInUsuario(this.form.value).subscribe({
      next:
        resp => {
          if (resp) {
            sessionStorage.setItem('token', resp.data.token);
            this.router.navigate(['/childrens']);
          }
        },
      error: err => {
          console.log(err);
          alert("Credenciales no válidas.");
        }
    })
  }

}
