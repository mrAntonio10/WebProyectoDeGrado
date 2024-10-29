import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoginService } from 'src/app/services/login/home.service';

@Component({
  selector: 'app-login-again',
  templateUrl: './login-again.component.html',
  providers: [MessageService],
  styleUrls: ['./login-again.component.scss']
})
export class LoginAgainComponent implements OnInit {
  formGroup: FormGroup;

  showPassword = false;
  passwordType = 'password';
  iconClass = 'pi pi-eye-slash';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private loginService: LoginService,
    private ref: DynamicDialogRef,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.buildForm();
  }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
    this.iconClass = this.showPassword ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  buildForm(): FormGroup {
    return this.fb.group({
      email: [localStorage.getItem('email'), [Validators.required]],
      password: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.formGroup.valid) {
      this.loginService.logInUser(this.formGroup.value).subscribe({
        next: resp => {
          if (resp) {
            localStorage.setItem('token', resp.data.token);
          }
        },
        error: err => {
          console.log(err);
          localStorage.setItem('error-login-again', err.error.data.response);
          // this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
          this.ref.close();
        },
        complete: () => {
          this.ref.close();
        }
      });
    }
  }
}
