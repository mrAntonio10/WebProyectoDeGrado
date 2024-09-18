import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice,  } from 'src/app/model/branchOffice/branchOffice';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { forkJoin } from 'rxjs';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { MessageService } from 'primeng/api';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-branch-office',
  templateUrl: './branch-office.component.html',
  providers: [MessageService],
  styleUrls: ['./branch-office.component.scss']
})
export class BranchOfficeComponent implements OnInit, OnDestroy {
  pageableData: IBranchOfficePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate = false;
  actions: any = [];
  submittedData: any;

  formGroup: FormGroup;
  formData: any;

  selectedState = null;
  enterpriseList : IEnterpriseState[];

  idEnterpriseFilter: string;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private branchOfficeService: BranchOfficeService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private enterpriseService: EnterpriseService,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {
     this.getBranchOfficePermissions();
     this.getEnterpriseCombo();
     this.formGroup = this.buildForm();

     this.buildPageStructure();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (this?.formData?.action === 'create') this.submitCreateBranchOffice(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateBranchOffice(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }


  private getBranchOfficePageableData(params: any = { page: 0, size: 5}) {
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
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/branchOffice");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        this.actions = [];

        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.getBranchOfficePageableData();
              break;
            case 'CREATE':
              this.isVisibleCreate = true;
              break;
            case 'DELETE':
              this.actions.unshift({icon: 'pi pi-lock', class: 'p-button-danger', actionName: 'block'})
              break;
            case 'UPDATE':
              this.actions.unshift({icon: 'pi pi-pencil', class: 'p-button-warning', actionName: 'edit'})
              this.actions.unshift({icon: 'pi pi-user', class: 'p-button-warning', actionName: 'branchOffice'})
              break;
          }
        });
      }
    )
  }

  private getEnterpriseCombo() {
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe(
      ([enterprises]) => {
        this.enterpriseList = enterprises.data;
        this.enterpriseList.unshift({name: 'Todas las empresas', id: '', state: ''})
      }
    );
  }

  blockBranchOffice(data: IBranchOfficePage) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de bloquear la sucursal ${data.name}?`,
      header: 'Eliminar sucursal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let deleteObservable = this.branchOfficeService.deleteBranchOffice(data.id);

        forkJoin([deleteObservable]).subscribe({
          next: ([deleted]) => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal eliminada exitosamente.' });
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

  buildEditBranchOffice(id: string) {
    this.activatedRoute.url.subscribe(urlSegments => {
      const fullPath = urlSegments.map(segment => segment.path).join('/');
      sessionStorage.setItem('fullPath', fullPath);

      let branchOfficeObservable = this.branchOfficeService.getBranchOfficesById(id);

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

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('idEnterprise', this.fb.control(''));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        this.idEnterpriseFilter = this.formGroup.value.idEnterprise;

        let params = { idEnterprise: this.idEnterpriseFilter };

        this.getBranchOfficePageableData(params);
    }
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
      {thead: 'Empresa', value: 'enterpriseName', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por empresa'},
      {thead: 'Factura', value: 'invoice', ttype: 'verified', visible: true, hasFilter: false, filterplaceholder: 'Buscar por facturación'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
    var getFilter = '';
    var enterpriseFilter = '';

    if (event.filters && event.filters.name) {
        if (!!event.filters.name[0].value) {
            getFilter = event.filters.name[0].value;
        }
    }

    if(!!this.idEnterpriseFilter) {
      enterpriseFilter = this.idEnterpriseFilter;
    }

    let params = { page: event.page, size: event.rows, filter: getFilter, idEnterprise: enterpriseFilter };

    this.getBranchOfficePageableData(params);
}


  submitCreateBranchOffice(submittedData: ICreateBranchOffice) {
    let createObservable = this.branchOfficeService.createBranchOffice(submittedData);

    forkJoin([createObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal creada exitosamente.' });
        this.ngOnInit(); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

  submitUpdateBranchOffice(submittedData: IUpdateBranchOffice) {
    let createObservable = this.branchOfficeService.updateBranchOffice(submittedData);

    forkJoin([createObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal Actualizada exitosamente.' });
        this.ngOnInit(); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

}
