import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { ICreateEnterprise, IEnterprise, IEnterprisePage } from 'src/app/model/enterprise/enterprise';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmationService } from 'primeng/api'; 
import { IUpdateEnterprise } from 'src/app/model/enterprise/enterprise';
import { PermissionService } from 'src/app/services/permission/permission.service';



@Component({
  selector: 'app-enterprise',
  templateUrl: './enterprise.component.html',
  styleUrls: ['./enterprise.component.scss']
})
export class EnterpriseComponent implements OnInit, OnDestroy {

  pageableData: IEnterprisePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate = false;
  submittedData: any;
  formData;

  constructor(private enterpriseService: EnterpriseService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService
  ) {

  }

  ngOnInit(): void {
    this.buildPageStructure();
    this.getEnterprisePermissions();

    this.formData =  JSON.parse(sessionStorage.getItem('formData'));

    if (this?.formData?.action === 'create') this.submitCreateEnterprise(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateEnterprise(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }

  private getEnterprisesPageableData(params: any = { page: 0, size: 5 }) {
    let enterpriseObservable = this.enterpriseService.getEnterprisePageable(params);

    forkJoin([enterpriseObservable]).subscribe(
        ([enterprises]) => {
            this.pageableData = enterprises.data;
        }
    );
  }

  handleActionTriggered(event: { action: string, data: IEnterprisePage }) {
    switch(event.action) {
      case 'block':
        this.blockEnterprise(event.data);
        break;

      case 'edit':
        this.buildEditEnterprise(event.data.id);
        break;

      case 'viewMore':
        this.branchOfficesViewByIdEnterprise(event.data.id);
        break;
      }
  }

  getEnterprisePermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/enterprise");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.getEnterprisesPageableData();
              break;
            case 'CREATE':
              this.buildCreateForm();
              this.isVisibleCreate = true;
              break;
          }
        });
      }
    )
  }

  blockEnterprise(data: IEnterprisePage) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de bloquear la empresa ${data.name}?`,
      header: 'Eliminar empresa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log(`Empresa con ID ${data.id} eliminada`);
        let deleteObservable = this.enterpriseService.deleteEnterprise(data.id);

        forkJoin([deleteObservable]).subscribe(
          ([deleted]) => {
              this.ngOnInit();
          }
      );
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  branchOfficesViewByIdEnterprise(id: string) {
    sessionStorage.setItem('idEnterprise', id);

    this.router.navigate(['dashboard/management/branchOffice']);
  }

  buildEditEnterprise(id: string) {
    this.activatedRoute.url.subscribe(urlSegments => {
      const fullPath = urlSegments.map(segment => segment.path).join('/');
      sessionStorage.setItem('fullPath', fullPath);

      let enterpriseObservable = this.enterpriseService.getEnterpriseById(id);

      forkJoin([enterpriseObservable]).subscribe(
          ([enterprise]) => {

            this.createFormStructure = {
              title: 'Actualizar empresa',  data: [
                { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', formValue: enterprise.data.name, visible: true },
                { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', formValue: enterprise.data.email, visible: true },
                { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', formValue: enterprise.data.description, visible: true },
                { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', formValue: enterprise.data.phoneNumber, visible: true },
                { md_col: 'md:col-4', label: 'Estado', type: 'select', formName: 'state', formValue: enterprise.data.state, visible: true },
                { md_col: 'md:col-4', label: 'Id', type: 'text', formName: 'id', formValue: enterprise.data.id, visible: false },
               ]
            };
              localStorage.setItem('dinamicFormConfig', JSON.stringify({...this.createFormStructure, action: 'update'}));
              this.router.navigate(['/dashboard/management/enterprise/create']);
          }
      );
    });
  }

  buildCreateForm() {
    // Estructura del formulario de creación
    this.createFormStructure = {
      title: 'Crear empresa',  data: [
        { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', visible: true },
        { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', visible: true },
        { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', visible: true },
        { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', visible: true},
      ]
    };
  }


  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id',ttype: 'number', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Nombre', value: 'name',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre'},
      {thead: 'Email', value: 'email', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por email'},
      {thead: 'Celular', value: 'phoneNumber', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por celular'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
    let params = { page: event.page, size: event.rows };

    this.getEnterprisesPageableData(params);
  }

  submitCreateEnterprise(submittedData: ICreateEnterprise) {
    let createObservable = this.enterpriseService.createEnterprise(submittedData);

    forkJoin([createObservable]).subscribe(
      ([created]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }

  submitUpdateEnterprise(submittedData: IUpdateEnterprise) {
    let createObservable = this.enterpriseService.updateEnterprise(submittedData);

    forkJoin([createObservable]).subscribe(
      ([updated]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }
}
