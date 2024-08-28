import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { ICreateEnterprise, IEnterprise, IEnterprisePage } from 'src/app/model/enterprise/enterprise';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { Router } from '@angular/router';

import { ConfirmationService } from 'primeng/api'; 



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
  submittedData: any;
  formData: ICreateEnterprise;

  constructor(private enterpriseService: EnterpriseService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {

  }

  ngOnInit(): void {
    //TODO get privileges...
    this.buildPageStructure();
    this.getEnterprisesPageableData();
    this.buildCreateForm();

    this.formData =  JSON.parse(sessionStorage.getItem('formData'));

    if (!!this.formData) {
        this.submitCreateEnterprise(this.formData);
    }
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
    let enterpriseObservable = this.enterpriseService.getEnterpriseById(id);

    let enterpriseData: IEnterprise;
    forkJoin([enterpriseObservable]).subscribe(
        ([enterprise]) => {
            enterpriseData = enterprise.data;
        }
    );

    this.createFormStructure = {
      title: 'Crear empresa',  data: [
        { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', formValue: enterpriseData.name },
        { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', formValue: enterpriseData.email },
        { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', formValue: enterpriseData.description },
        { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', formValue: enterpriseData.phoneNumber},
      ]
    };
  }

  buildCreateForm() {
    // Estructura del formulario de creación
    this.createFormStructure = {
      title: 'Crear empresa',  data: [
        { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name' },
        { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email' },
        { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description' },
        { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber'},
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
}
