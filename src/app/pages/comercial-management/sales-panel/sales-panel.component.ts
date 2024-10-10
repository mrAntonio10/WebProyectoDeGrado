import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice } from 'src/app/model/branchOffice/branchOffice';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { IDetailWarehouseProducts, ISalesPanelPageableContent } from 'src/app/model/warehouse/warehouse';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { PermissionService } from 'src/app/services/permission/permission.service';

@Component({
  selector: 'app-sales-panel',
  templateUrl: './sales-panel.component.html',
  providers: [MessageService],
  styleUrls: ['./sales-panel.component.scss']
})
export class SalesPanelComponent implements OnInit, OnDestroy {
  pageableData: ISalesPanelPageableContent;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate = false;
  actions: any = [];
  submittedData: any;

  formGroup: FormGroup;
  formData: any;

  productName: string = '';

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
      this.productName = sessionStorage.getItem('pName');

      this.getSalesPanelPermission();

      this.buildPageStructure();
  
      this.formData =  JSON.parse(sessionStorage.getItem('formData'));
  
      if (this?.formData?.action === 'create') this.submitCreateBranchOffice(this.formData);
      if (this?.formData?.action === 'update') this.submitUpdateBranchOffice(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
    sessionStorage.removeItem('pName');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault(); //Prevenimos la pantalla de impresión
      this.routeAddProductToDetail();
    }
  }

  routeAddProductToDetail() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel/add-product']);
  }


  private getProductsFromOrderPageableData(params: any = { page: 0, size: 5}) {
    if(!!this.productName) {

      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: `Producto ${this.productName} añadido exitosamente.` });
      sessionStorage.removeItem('pName');
    }

    this.pageableData = JSON.parse(sessionStorage.getItem('productDetail'));

  }

  handleActionTriggered(event: { action: string, data: IDetailWarehouseProducts }) {
    switch(event.action) {
      case 'block':
        this.deleteProductFromOrder(event.data);
        break;
      }
  }

  getSalesPanelPermission() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/sales-panel");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        this.actions = [];

        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.getProductsFromOrderPageableData();
              break;
            case 'CREATE':
              break;
            case 'DELETE':
              this.actions.unshift({icon: 'pi pi-times', class: 'p-button-danger', actionName: 'block'})
              break;
            case 'UPDATE':
              break;
          }
        });
      }
    )
  }

  deleteProductFromOrder(data: IDetailWarehouseProducts) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el producto ${data.productName}?`,
      header: 'Eliminar producto',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
          var deleteItemIndex = this.pageableData.content.findIndex(d => d.idProduct === data.idProduct);

          if (deleteItemIndex !== -1) {
            this.pageableData.content.splice(deleteItemIndex, 1);

            sessionStorage.setItem('productDetail', JSON.stringify(this.pageableData))
          }
      
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto eliminado exitosamente.' });
          this.getProductsFromOrderPageableData();
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  private buildPageStructure() {
    this.tableStructure = [
        // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'idProduct', value: 'idProduct', ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id'},
      {thead: 'Detalle', value: 'productName',ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nombre'},
      {thead: 'Cantidad', value: 'quantity', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por cantidad'},
      {thead: 'Precio total', value: 'totalPrice', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Buscar por precio'},
      {thead: 'Descuento', value: 'totalDiscount', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Buscar por descuento'}
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

    let params = { page: event.page, size: event.rows, filter: getFilter };

    this.getProductsFromOrderPageableData(params);
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