import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { IUser } from 'src/app/model/user/usuario';
import { RolService } from 'src/app/services/roles/rol.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  formValue: IUser;

  buttonValue: string;
  componentBehaviour: string;

  selectedRole: String;
  permissions: [];
  selectedState = null;
  states = [
    {name: 'Activo', code: 'ACTIVE'},
    {name: 'Bloqueado', code: 'BLOCKED'},
    {name: 'Eliminado', code: 'DELETED'},
  ];
  
    constructor(private breadcrumbService: BreadcrumbService,
        private fb: FormBuilder, 
        private router: Router,
        private activeRoute: ActivatedRoute,
        private rolService: RolService,
    ) {
        this.breadcrumbService.setItems([
            {label: 'Gestión'},
            {label: 'Usuarios'}
        ]);
    }

    ngOnInit(): void {
        this.formValue = JSON.parse(localStorage.getItem('dinamicFormConfig'));
        this.componentBehaviour = JSON.parse(localStorage.getItem('dinamicFormConfig')).action;

        (this.componentBehaviour === 'update' ? this.buttonValue = 'Actualizar' : this.buttonValue = 'Crear');

        this.getRolList();
        this.formGroup = this.buildForm();
    }

    ngOnDestroy(): void {
      localStorage.removeItem('dinamicFormConfig');
    }

    buildForm(): FormGroup {
        this.selectedState = this.formValue?.state;
        this.selectedRole = this.formValue?.idRol;

        const group = this.fb.group({});

          group.addControl('id', this.fb.control((!!this.formValue?.id ? this.formValue?.id : '')));
          group.addControl('name', this.fb.control((!!this.formValue?.name ? this.formValue?.name : ''), Validators.required));
          group.addControl('lastname', this.fb.control((!!this.formValue?.lastname ? this.formValue?.lastname : ''), Validators.required));
          group.addControl('phoneNumber', this.fb.control((!!this.formValue?.phoneNumber ? this.formValue?.phoneNumber : ''), (Validators.pattern("[0-9]+"), Validators.maxLength(20))));
          group.addControl('email', this.fb.control( (!!this.formValue?.email ? this.formValue?.email : ''), (Validators.required, Validators.email)));
          group.addControl('state', this.fb.control((!!this.formValue?.state ? this.selectedState : '')));
          group.addControl('password', this.fb.control(''));


          group.addControl('idBranchOffice', this.fb.control( sessionStorage.getItem('idBranchOffice'), Validators.required));
          group.addControl('idRol', this.fb.control((!!this.formValue?.idRol ? this.selectedRole : ''), Validators.required));
          

        return group;
      }
    
      private getRolList() {
        let rolObservable = this.rolService.getPermissionsByRol();
    
        forkJoin([rolObservable]).subscribe(
          ([rol]) => {
            this.permissions = rol.data;
          }
        )
      }

      submitForm() {
        if (this.formGroup.valid) {
            const fullPathData = sessionStorage.getItem('fullPath');
            sessionStorage.removeItem('fullPath');

                console.log("full path", fullPathData);
    
                sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: this.componentBehaviour}));
                this.router.navigate([`/dashboard/${fullPathData}`]);
                
        }
    }

}
