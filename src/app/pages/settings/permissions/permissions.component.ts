import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { ICreateEnterprise, IEnterprise, IEnterprisePage } from 'src/app/model/enterprise/enterprise';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { ActivatedRoute, Router } from '@angular/router';

import { PermissionService } from 'src/app/services/permission/permission.service';

import { ConfirmationService } from 'primeng/api'; 
import { IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RolService } from 'src/app/services/roles/rol.service';



@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit, OnDestroy {

  permissions: [];
  formGroup: FormGroup;
  permissionList;
  selectedRole: String;

  constructor(private fb: FormBuilder,
    private permissionService: PermissionService,
    private rolService: RolService,
    
    private enterpriseService: EnterpriseService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.getRolList();
    this.formGroup = this.buildForm();
    //TODO get privileges...
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }

  private getRolList() {
    let rolObservable = this.rolService.getPermissionsByRol();

    forkJoin([rolObservable]).subscribe(
      ([rol]) => {
        console.log("ESTOOO ??", rol.data);
        this.permissions = rol.data;
      }
    )
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('idRol', this.fb.control(''));

    return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
      let permissionsObservable = this.permissionService.getPermissionsByRol(this.formGroup.value);

      forkJoin([permissionsObservable]).subscribe(
          ([permission]) => {
            this.permissionList = permission.data;
            this.selectedRole = this.formGroup.get('idRol').value;
          }
      ); 
    }
}

  //REVISAR

  // private getEnterprisesPageableData(params: any = { page: 0, size: 5 }) {
  //   let enterpriseObservable = this.enterpriseService.getEnterprisePageable(params);

  //   forkJoin([enterpriseObservable]).subscribe(
  //       ([enterprises]) => {
  //           this.pageableData = enterprises.data;
  //       }
  //   );
  // }

  // handleActionTriggered(event: { action: string, data: IEnterprisePage }) {
  //   switch(event.action) {
  //     case 'block':
  //       this.blockEnterprise(event.data);
  //       break;

  //     case 'edit':
  //       this.buildEditEnterprise(event.data.id);
  //       break;

  //     case 'branchOffice':
  //       this.branchOfficesViewByIdEnterprise(event.data.id);
  //       break;
  //     }
  // }

  // blockEnterprise(data: IEnterprisePage) {
  //   this.confirmationService.confirm({
  //     message: `¿Estás seguro de bloquear la empresa ${data.name}?`,
  //     header: 'Eliminar empresa',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       console.log(`Empresa con ID ${data.id} eliminada`);
  //       let deleteObservable = this.enterpriseService.deleteEnterprise(data.id);

  //       forkJoin([deleteObservable]).subscribe(
  //         ([deleted]) => {
  //             this.ngOnInit();
  //         }
  //     );
  //     },
  //     reject: () => {
  //       console.log('Acción de bloqueo cancelada');
  //     }
  //   });
  // }

  submitUpdatePermission(submittedData: IUpdateEnterprise) {
    let createObservable = this.enterpriseService.updateEnterprise(submittedData);

    forkJoin([createObservable]).subscribe(
      ([updated]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }
}