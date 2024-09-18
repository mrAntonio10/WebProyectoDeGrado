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

  isVisibleSideBar = false;

  valToggle = false;

  permissionFormGroup: FormGroup;

  constructor(private fb: FormBuilder,
    private permissionService: PermissionService,
    private rolService: RolService,
    
    private enterpriseService: EnterpriseService,
  ) {

  }

  ngOnInit(): void {
    this.getRolList();
    this.formGroup = this.buildForm();
    this.permissionFormGroup = this.buildPermissionForm();
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

  buildPermissionForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('state', this.fb.control(''));

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

  getPermissionById(id: string) {
    this.isVisibleSideBar = true;
    console.log("id xdd", id);
  }

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