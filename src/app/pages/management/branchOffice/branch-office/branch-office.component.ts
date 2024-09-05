import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice,  } from 'src/app/model/branchOffice/branchOffice';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { forkJoin } from 'rxjs';
import { PermissionService } from 'src/app/services/permission/permission.service';
@Component({
  selector: 'app-branch-office',
  templateUrl: './branch-office.component.html',
  styleUrls: ['./branch-office.component.scss']
})
export class BranchOfficeComponent implements OnInit, OnDestroy {
  pageableData: IBranchOfficePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate = false;
  submittedData: any;
  formData: any;

  idEnterprise: string;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private branchOfficeService: BranchOfficeService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService) {

  }

  ngOnInit(): void {
    this.idEnterprise = sessionStorage.getItem('idEnterprise');

     //TODO get privileges...
     this.buildPageStructure();
     this.getBranchOfficePermissions();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (this?.formData?.action === 'create') this.submitCreateBranchOffice(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateBranchOffice(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
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
        this.buildEditBranchOffice(event.data.id);
        break;

      case 'viewMore':
        this.usersViewByIdBranchOffice(event.data.id);
        break;
        
      }
  }

  getBranchOfficePermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/enterprise");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.getBranchOfficePageableData(this.idEnterprise);
              break;
            case 'CREATE':
              this.isVisibleCreate = true;
              break;
          }
        });
      }
    )
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

  buildEditBranchOffice(id: string) {
    this.activatedRoute.url.subscribe(urlSegments => {
      const fullPath = urlSegments.map(segment => segment.path).join('/');
      sessionStorage.setItem('fullPath', fullPath);

      let branchOfficeObservable = this.branchOfficeService.getBranchOfficeseById(id);

      let branchOfficeData: IBranchOffice;
      forkJoin([branchOfficeObservable]).subscribe(
          ([branchOffice]) => {
              branchOfficeData = { ...branchOffice.data, action : 'update' };
              localStorage.setItem('dinamicFormConfig', JSON.stringify(branchOfficeData));
              this.router.navigate(['/dashboard/management/branchOffice/create']);
          }
      );
    });
  }

  usersViewByIdBranchOffice(id: string) {
    sessionStorage.setItem('idBranchOffice', id);

    this.router.navigate(['dashboard/management/user']);
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

  submitUpdateBranchOffice(submittedData: IUpdateBranchOffice) {
    let createObservable = this.branchOfficeService.updateBranchOffice(submittedData);

    forkJoin([createObservable]).subscribe(
      ([created]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }

}
