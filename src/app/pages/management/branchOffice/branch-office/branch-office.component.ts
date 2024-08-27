import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice,  } from 'src/app/model/branchOffice/branchOffice';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-branch-office',
  templateUrl: './branch-office.component.html',
  styleUrls: ['./branch-office.component.scss']
})
export class BranchOfficeComponent implements OnInit {
  pageableData: IBranchOfficePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  submittedData: any;
  formData: ICreateBranchOffice;

  idEnterprise: string;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private branchOfficeService: BranchOfficeService) {

  }

  ngOnInit(): void {
    this.idEnterprise = sessionStorage.getItem('idEnterprise');

     //TODO get privileges...
     this.buildPageStructure();
     this.getBranchOfficePageableData(this.idEnterprise);
     this.buildCreateForm();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (!!this.formData) {
         this.submitCreateBranchOffice(this.formData);
     }
  }

  private getBranchOfficePageableData(idEnterprise: String, params: any = { page: 0, size: 5, idEnterprise: idEnterprise}) {
    let branchOfficeObservable = this.branchOfficeService.getBranchOfficePageable(params);

    forkJoin([branchOfficeObservable]).subscribe(
        ([branchOffices]) => {
            this.pageableData = branchOffices.data;
        }
    );
  }

  handleActionTriggered(event: { action: string, data: IBranchOfficePage }) {
    switch(event.action) {
      case 'block':
        this.blockBranchOffice(event.data);
        break;

      case 'edit':
        this.editBranchOffice(event.data.id);
        break;

      }
  }

  blockBranchOffice(data: IBranchOfficePage) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de bloquear la sucursal ${data.name}?`,
      header: 'Eliminar sucursal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log(`Sucursal con ID ${data.id} eliminada`);
        let deleteObservable = this.branchOfficeService.deleteBranchOffice(data.id);

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

  editBranchOffice(id: string) {
    let branchOfficeObservable = this.branchOfficeService.getBranchOfficeseById(id);

    let branchOfficeData: IBranchOffice;
    forkJoin([branchOfficeObservable]).subscribe(
        ([branchOffice]) => {
            branchOfficeData = branchOffice.data;
        }
    );

    // this.createFormStructure = {
    //   title: 'Crear empresa',  data: [
    //     { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name', formValue: branchOfficeData.name },
    //     { md_col: 'md:col-4', label: 'Email', type: 'text', formName: 'email', formValue: branchOfficeData.email },
    //     { md_col: 'md:col-4', label: 'Descripción', type: 'text', formName: 'description', formValue: branchOfficeData.description },
    //     { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber', formValue: branchOfficeData.phoneNumber},
    //   ]
    // };
  }

  buildCreateForm() {
    // Estructura del formulario de creación
    this.createFormStructure = {
      title: 'Crear sucursal',  data: [
        { md_col: 'md:col-4', label: 'Nombre', type: 'text', formName: 'name' },
        { md_col: 'md:col-4', label: 'Ubicación', type: 'text', formName: 'location' },
        { md_col: 'md:col-4', label: 'Número telefónico', type: 'text', formName: 'phoneNumber'},
        { md_col: 'md:col-4', label: 'Id empresa', type: 'text', formName: 'idEnterprise' },
        { md_col: 'md:col-4', label: 'Facturan', type: 'boolean', formName: 'invoice' },
        { md_col: 'md:col-4', label: 'Código impuestos nacionales', type: 'text', formName: 'inCode' },
      ]
    };
  }


  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id',ttype: 'number', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Nombre', value: 'name',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre'},
      {thead: 'Ubicación', value: 'location', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por ubucación'},
      {thead: 'Celular', value: 'phoneNumber', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por celular'},
      {thead: 'Factura', value: 'invoice', ttype: 'verified', visible: true, hasFilter: false, filterplaceholder: 'Buscar por facturación'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
    let params = { page: event.page, size: event.rows };

    this.getBranchOfficePageableData(this.idEnterprise, params);
  }

  submitCreateBranchOffice(submittedData: ICreateBranchOffice) {
    let createObservable = this.branchOfficeService.createBranchOffice(submittedData);

    forkJoin([createObservable]).subscribe(
      ([created]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }

}
