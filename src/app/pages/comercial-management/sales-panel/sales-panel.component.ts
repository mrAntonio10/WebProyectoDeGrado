import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice } from 'src/app/model/branchOffice/branchOffice';
import { ICreateDocument } from 'src/app/model/document/document';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { IDetailWarehouseProducts, ISalesPanelPageableContent } from 'src/app/model/warehouse/warehouse';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { DocumentService } from 'src/app/services/document/document.service';
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
  clientName: string = '';
  totalPrice: number = 0;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private branchOfficeService: BranchOfficeService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private enterpriseService: EnterpriseService,
    private documentService: DocumentService,
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {

      this.breadcrumbService.setItems([
        {label: 'Gestión comercial'},
        {label: 'Panel de ventas'}
      ]);
    
      this.productName = sessionStorage.getItem('pName');

      this.getSalesPanelPermission();

      this.buildPageStructure();
  
      this.formData =  JSON.parse(sessionStorage.getItem('formData'));
  
      if (this?.formData?.action === 'create') this.messageCreatedSale(this.formData);
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
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault(); //Prevenimos la pantalla de impresión
      this.deleteAllProductsFromDetail();
    }
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault(); //Prevenimos la pantalla de impresión
      this.routeAddClientInfo();
    }
    if (event.ctrlKey && event.key === 'd' && this.pageableData.content.length > 0) {
      event.preventDefault(); //Prevenimos la pantalla de impresión
      this.routePaymentMethod();
    }
  }

  routeAddProductToDetail() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel/add-product']);
  }

  routeAddClientInfo() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel/add-client-info']);
  }

  routePaymentMethod() {
    sessionStorage.setItem('totalPrice', this.totalPrice.toString());
    this.router.navigate(['/dashboard/comercial-management/sales-panel/payment-method']);
  }

  deleteAllProductsFromDetail() {
    sessionStorage.removeItem('clientName');
    this.clientName = '';
    sessionStorage.removeItem('productDetail');
    this.totalPrice = 0;

    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Detalle eliminado exitosamente.' });
    this.getProductsFromOrderPageableData();
  }

  private getProductsFromOrderPageableData(params: any = { page: 0, size: 5}) {
    if(!!this.productName) {

      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: `Producto ${this.productName} añadido exitosamente.` });
      sessionStorage.removeItem('pName');
      this.productName = '';
    }

    this.pageableData = JSON.parse(sessionStorage.getItem('productDetail'));

    this.totalPrice = this.getTotalPrice();

  }

  handleActionTriggered(event: { action: string, data: IDetailWarehouseProducts }) {
    switch(event.action) {
      case 'block':
        this.deleteProductFromOrder(event.data);
        break;
      case 'quantity':
        this.setTotalPriceByQuantityChange(event.data)
        break;
      case 'totalDiscount':
        this.setTotalPriceByDiscountChange(event.data)
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
              this.actions.unshift({icon: 'pi pi-times', class: 'p-button-danger', actionName: 'block'});
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

  setTotalPriceByQuantityChange(data) {
    var itemIndex = this.pageableData.content.findIndex(d => d.idProduct === data.idProduct);

    if (itemIndex !== -1) {
      if(this.pageableData.content[itemIndex].totalDiscount > (data.quantity * this.pageableData.content[itemIndex].unitaryCost)) {
        this.pageableData.content[itemIndex].totalDiscount = (data.quantity * this.pageableData.content[itemIndex].unitaryCost);
      }

      this.pageableData.content[itemIndex].quantity = data.quantity;
      this.pageableData.content[itemIndex].totalPrice = (data.quantity * this.pageableData.content[itemIndex].unitaryCost) - this.pageableData.content[itemIndex].totalDiscount;

      sessionStorage.setItem('productDetail', JSON.stringify(this.pageableData));

      let copyTotalPrices = JSON.parse(sessionStorage.getItem('totalPricesCopy'));
      copyTotalPrices[itemIndex] = data.quantity * this.pageableData.content[itemIndex].unitaryCost;

      sessionStorage.setItem('totalPricesCopy', JSON.stringify(copyTotalPrices));
    }

    this.getProductsFromOrderPageableData();
  }

  setTotalPriceByDiscountChange(data) {
    var itemIndex = this.pageableData.content.findIndex(d => d.idProduct === data.idProduct);
    var totalPricesCopy = JSON.parse(sessionStorage.getItem('totalPricesCopy'));

    if (itemIndex !== -1) {
      if(data.totalDiscount === 0) {
        this.pageableData.content[itemIndex].totalPrice = (data.quantity * this.pageableData.content[itemIndex].unitaryCost);
        totalPricesCopy[itemIndex] = this.pageableData.content[itemIndex].totalPrice;

        sessionStorage.setItem('totalPricesCopy', JSON.stringify(totalPricesCopy));
      } else {
        this.pageableData.content[itemIndex].totalPrice = totalPricesCopy[itemIndex] - data.totalDiscount;
      }

      sessionStorage.setItem('productDetail', JSON.stringify(this.pageableData))
    }

    this.getProductsFromOrderPageableData();
  }

  getTotalPrice(): number {
    let totalPrice = 0;

    let productDetailList = JSON.parse(sessionStorage.getItem('productDetail'))?.content ?? [];

    if(productDetailList.length > 0) {
      productDetailList.forEach(d => {
        totalPrice += d.totalPrice;
      });
    }
    return totalPrice;
  }

  private buildPageStructure() {
    this.clientName = sessionStorage.getItem('clientName');

    this.tableStructure = [
        // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'idProduct', value: 'idProduct', ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id'},
      {thead: 'Detalle', value: 'productName',ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nombre'},
      {thead: 'Precio unitario', value: 'unitaryCost',ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nombre'},
      {thead: 'Cantidad', value: 'quantity', ttype: 'number', visible: true, hasFilter: false, isEditable: true, filterplaceholder: 'Buscar por cantidad'},
      {thead: 'Descuento (BOB)', value: 'totalDiscount', ttype: 'decimal', visible: true, hasFilter: false, isEditable: true, filterplaceholder: 'Buscar por descuento'},
      {thead: 'Precio total', value: 'totalPrice', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Buscar por precio'},
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


  messageCreatedSale(submittedData: ICreateDocument) {
    let createDocumentObservable = this.documentService.createDocument(submittedData);

    forkJoin([createDocumentObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Venta generada exitosamente.' });
          sessionStorage.removeItem('clientName');
          this.clientName = '';
          sessionStorage.removeItem('productDetail');
          this.totalPrice = 0;

        this.getProductsFromOrderPageableData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

}