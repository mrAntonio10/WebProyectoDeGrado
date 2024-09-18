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
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-enterprise',
  templateUrl: './enterprise.component.html',
  providers: [MessageService],
  styleUrls: ['./enterprise.component.scss']
})
export class EnterpriseComponent implements OnInit, OnDestroy {

  pageableData: IEnterprisePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate: boolean = null;
  actions: any = [];
  submittedData: any;
  formData;

  constructor(private enterpriseService: EnterpriseService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
  ) {

  }

  ngOnInit(): void {
    this.getEnterprisePermissions();

    this.buildPageStructure();

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

      case 'branchOffice':
        this.branchOfficesViewByIdEnterprise(event.data.id);
        break;
      }
  }

  getEnterprisePermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/enterprise");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        console.log("PERMISOS ", permission.data);
        this.actions = [];

        permission.data.forEach(permission => {          
          switch (permission.permissionName) {
            case 'VIEW':
              this.getEnterprisesPageableData();
              break;
            case 'CREATE':
              this.buildCreateForm();
              this.isVisibleCreate = true;
              break;
            case 'DELETE':
              this.actions.unshift({icon: 'pi pi-lock', class: 'p-button-danger', actionName: 'block'})
              break;
            case 'UPDATE':
              this.actions.unshift({icon: 'pi pi-pencil', class: 'p-button-warning', actionName: 'edit'})
              this.actions.unshift({icon: 'pi pi-building', class: 'p-button-warning', actionName: 'branchOffice'})
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

        forkJoin([deleteObservable]).subscribe({
          next: ([deleted]) => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Empresa eliminada exitosamente.' });
            this.ngOnInit(); 
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
          }
        });
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
                { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', formValue: enterprise.data.name, visible: true,  validators: [ { name: 'required' }, { name: 'maxLength', args: 120 }], validatorMssg: 'Requerido. Máximo 120 caracteres.' },
                { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', formValue: enterprise.data.email, visible: true, validators: [{ name: 'required' }, { name: 'email' }], validatorMssg: 'Requerido. Ingrese un correo electrónico válido.' },
                { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', formValue: enterprise.data.description, visible: true, validators: [{ name: 'required' }],  validatorMssg: 'Requerido.' },
                { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', formValue: enterprise.data.phoneNumber, visible: true, validators: [{ name: 'required' }, { name: 'pattern', args: '^[\\d]*$' }, { name: 'maxLength', args: 20 }],  validatorMssg: 'Requerido. Numérico.' },
                { md_col: 'md:col-4', label: 'Estado', type: 'select', formName: 'state', formValue: enterprise.data.state, visible: true, validators: [{ name: 'required' }],  validatorMssg: 'Requerido' },
                { md_col: 'md:col-4', label: 'Id', type: 'text', formName: 'id', formValue: enterprise.data.id, visible: false, validators: [{ name: 'required' }],  validatorMssg: 'Requerido' },
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
      title: 'Crear empresa', 
      data: [
        { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', visible: true, validators: [ { name: 'required' }, { name: 'maxLength', args: 120 }], validatorMssg: 'Requerido. Máximo 120 caracteres.' },
        { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', visible: true, validators: [{ name: 'required' }, { name: 'email' }], validatorMssg: 'Requerido. Ingrese un correo electrónico válido.' },
        { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', visible: true, validators: [{ name: 'required' }],  validatorMssg: 'Requerido.' },
        { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', visible: true, validators: [{ name: 'required' }, { name: 'pattern', args: '^[\\d]*$' }, { name: 'maxLength', args: 20 }],  validatorMssg: 'Requerido. Numérico 20 caracteres.'}
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
        var getFilter = '';

        if (event.filters && event.filters.name) {
            if (!!event.filters.name[0].value) {
                getFilter = event.filters.name[0].value;
            }
        }
        console.log("se ejecuta el onpagechange");
        let params = { page: event.page, size: event.rows, filter: getFilter };

        this.getEnterprisesPageableData(params);
  }


  submitCreateEnterprise(submittedData: ICreateEnterprise) {
    let createObservable = this.enterpriseService.createEnterprise(submittedData);

    forkJoin([createObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Empresa creada exitosamente.' });
        this.ngOnInit(); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })      

  }

  submitUpdateEnterprise(submittedData: IUpdateEnterprise) {
    let createObservable = this.enterpriseService.updateEnterprise(submittedData);

    forkJoin([createObservable]).subscribe({
      next: ([updated]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Empresa actualizada exitosamente.' });
        this.ngOnInit(); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }
}
