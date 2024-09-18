import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { IUser } from 'src/app/model/user/usuario';
import { RolService } from 'src/app/services/roles/rol.service';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { forkJoin } from 'rxjs';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { MessageService } from 'primeng/api';
import { C } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-create-user',
  providers: [MessageService],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  formValue: IUser;

  buttonValue: string;
  componentBehaviour: string;

  enterpriseList : IEnterpriseState[];
  branchOfficeList : IEnterpriseState[];

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
        private enterpriseService: EnterpriseService,
        private branchOfficeService: BranchOfficeService,
        private messageService: MessageService,
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
        this.getEnterpriseCombo();
        this.formGroup = this.buildForm();
    }

    ngOnDestroy(): void {
      localStorage.removeItem('dinamicFormConfig');
    }

    private getEnterpriseCombo() {
      let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();
  
      forkJoin([observableEnterpriseList]).subscribe(
        ([enterprises]) => {
          this.enterpriseList = enterprises.data;
          this.enterpriseList.unshift({name: 'Seleccionar empresa', id: '', state: ''})
        }
      );
    }

    getBranchOfficeByIdEnterprise(event) {
      let idEnterprise: string = event.value;
      let observableBranchOfficeList = this.branchOfficeService.getBranchOfficesListByIdEnterprise(idEnterprise);

      forkJoin([observableBranchOfficeList]).subscribe({
        next: ([list]) => {
          this.branchOfficeList = list.data;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
        }
      })
    }

    buildForm(): FormGroup {
        this.selectedState = this.formValue?.state;
        this.selectedRole = this.formValue?.idRol;

        const group = this.fb.group({});

          group.addControl('id', this.fb.control((!!this.formValue?.id ? this.formValue?.id : '')));
          group.addControl('name', this.fb.control((!!this.formValue?.name ? this.formValue?.name : ''), [Validators.required, Validators.maxLength(60)]));
          group.addControl('lastname', this.fb.control((!!this.formValue?.lastname ? this.formValue?.lastname : ''), [Validators.required, Validators.maxLength(60)]));
          group.addControl('phoneNumber', this.fb.control((!!this.formValue?.phoneNumber ? this.formValue?.phoneNumber : ''), [Validators.pattern('^[\\d]*$'), Validators.maxLength(20)]));
          group.addControl('email', this.fb.control( (!!this.formValue?.email ? this.formValue?.email : ''), [Validators.required, Validators.email]));
          group.addControl('state', this.fb.control((!!this.formValue?.state ? this.selectedState : '')));
          group.addControl('password', this.fb.control('', [Validators.required, Validators.maxLength(60)]));


          group.addControl('idEnterprise', this.fb.control((!!this.formValue?.idEnterprise ? this.formValue?.idEnterprise : ''), [Validators.required]));
          group.addControl('idBranchOffice', this.fb.control((!!this.formValue?.idBranchOffice ? this.formValue?.idBranchOffice : ''), [Validators.required]));
          group.addControl('idRol', this.fb.control((!!this.formValue?.idRol ? this.selectedRole : ''), Validators.required));


          if(!!this.formValue?.idEnterprise) {
            let observableBranchOfficeList = this.branchOfficeService.getBranchOfficesListByIdEnterprise(this.formValue?.idEnterprise);

            forkJoin([observableBranchOfficeList]).subscribe({
              next: ([list]) => {
                this.branchOfficeList = list.data;
              },
              error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
              }
            })
          };

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
