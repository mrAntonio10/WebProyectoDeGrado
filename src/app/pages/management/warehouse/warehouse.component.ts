import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { IWarehousePaged } from 'src/app/model/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  providers: [MessageService],
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {
  pageableData: IWarehousePaged;
  tableStructure: ColumnStructure[];
  gobalFilters;

  actions: any = [];

  createFormStructure: FormConfig;
  isVisibleCreate: boolean;
  submittedData: any;
  formData: any;

  enterpriseList: any = [];
  branchOfficeList: any = [];

  formGroup: FormGroup;
  idBranchOfficeFilter : string;


  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private fb: FormBuilder,
    // private enterpriseService: EnterpriseService,
    // private branchOfficeService: BranchOfficeService
  ) {

  }

  ngOnInit(): void {

     this.getWarehousePermissions();
     this.getWarehousePageableData();

     this.formGroup = this.buildForm();

    //  this.getEnterpriseCombo();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
    //  if (this?.formData?.action === 'create') this.submitCreateUser(this.formData);
    //  if (this?.formData?.action === 'update') this.submitUpdateUser(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }

  getWarehousePermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/warehouse");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        this.actions = [];

        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.buildPageStructure();
              break;
            case 'CREATE':
              this.isVisibleCreate = true;
              break;
            case 'DELETE':
              this.actions.unshift({icon: 'pi pi-lock', class: 'p-button-danger', actionName: 'block'})
              break;
            case 'UPDATE':
              this.actions.unshift({icon: 'pi pi-pencil', class: 'p-button-warning', actionName: 'edit'})
              break;
          }
        });
      }
    )
  }


  private getWarehousePageableData(params: any = { page: 0, size: 5 }) {
    let warehouseObservable = this.warehouseService.getWarehousePageable(params);

    forkJoin([warehouseObservable]).subscribe(
        ([warehouse]) => {
            this.pageableData = warehouse.data;
        }
    );
  }

  handleActionTriggered(event: { action: string, data: any }) {
    switch(event.action) {
      case 'block':
        this.blockProduct(event.data);
        break;

      case 'edit':
        // this.buildEditUser(event.data.id);
        break;

      }
  }

  blockProduct(data: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el producto ${data.productName}?`,
      header: 'Eliminar producto',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log(`Producto con ID  almacén ${data.id} eliminado`);
        let deleteObservable = this.warehouseService.deleteWarehouse(data.id);

        forkJoin([deleteObservable]).subscribe({
          next:  ([deleted]) => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto eliminado exitosamente.' });
            this.ngOnInit();
        }, 
        error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
          }
        }
      );
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  // buildEditUser(id: string) {
  //   this.activatedRoute.url.subscribe(urlSegments => {
  //     const fullPath = urlSegments.map(segment => segment.path).join('/');
  //     sessionStorage.setItem('fullPath', fullPath);

  //     let userObserable = this.warehouseService.getUserById(id);

  //     let userData: IUser;
  //     forkJoin([userObserable]).subscribe(
  //         ([user]) => {
  //             userData = { ...user.data, action : 'update' };
  //             localStorage.setItem('dinamicFormConfig', JSON.stringify(userData));
  //             this.router.navigate(['/dashboard/management/user/create']);
  //         }
  //     );
  //   });
  // }

  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id', ttype: 'text', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Producto', value: 'productName',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre producto'},
      {thead: 'Categoría', value: 'category', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por categoría'},
      {thead: 'Stock', value: 'stock', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por stock'},
      {thead: 'Precio unitario', value: 'unitaryCost', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por precio'},
      {thead: 'Min', value: 'min', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por límite mínimo'},
      {thead: 'Max', value: 'max', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por límite máximo'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  // private getEnterpriseCombo() {
  //   let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

  //   forkJoin([observableEnterpriseList]).subscribe(
  //     ([enterprises]) => {
  //       this.enterpriseList = enterprises.data;
  //       this.enterpriseList.unshift({name: 'Todas las empresas', id: '', state: ''})
  //     }
  //   );
  // }

  // getBranchOfficeCombo(event) {
  //   console.log("EVENT ", event.value);

  //   let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(event.value);

  //   forkJoin([observableBranchOfficeList]).subscribe(
  //     ([branchOffices]) => {
  //       this.branchOfficeList = branchOffices.data;
  //       this.branchOfficeList.unshift({name: 'Todas las sucursales', id: '', state: ''})
  //     }
  //   );
  // }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('idEnterprise', this.fb.control(''));
      group.addControl('idBranchOffice', this.fb.control(''));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        this.idBranchOfficeFilter = this.formGroup.value.idBranchOffice;

        let params = { idBranchOffice: this.idBranchOfficeFilter };

        this.getWarehousePageableData(params);
    }
  }  

  onPageChange(event: any) {
    var getFilter = '';
    // var branchOfficeFilter = '';

    if (event.filters && event.filters.productName) {
        if (!!event.filters.productName[0].value) {
            getFilter = event.filters.productName[0].value;
        }
    }
    // if(!!this.idBranchOfficeFilter) {
    //   branchOfficeFilter = this.idBranchOfficeFilter;
    // }

    let params = { page: event.page, size: event.rows , filter: getFilter};

    this.getWarehousePageableData(params);
  }

  // submitCreateUser(submittedData: ICreateUser) {
  //   let createObservable = this.warehouseService.createUser(submittedData);

  //   forkJoin([createObservable]).subscribe({
  //     next:  ([created]) => {
  //       sessionStorage.removeItem('formData');
  //       this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Usuario creado exitosamente.' });
  //       this.ngOnInit(); 
  //     }, 
  //     error: (err) => {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
  //     }
  //   }
  //   )
  // }

  // submitUpdateUser(submittedData: IUpdateUser) {
  //   let updateObservable = this.warehouseService.updateUser(submittedData);

  //   forkJoin([updateObservable]).subscribe({
  //     next: ([created]) => {
  //       sessionStorage.removeItem('formData');
  //       this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Usuario actualizado exitosamente.' });
  //       this.ngOnInit(); 
  //     },
  //     error: (err) => {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
  //     }
  //   }
  //   )
  // }

}
