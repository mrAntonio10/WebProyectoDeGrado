import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IProductPage } from 'src/app/model/product/product';
import { IDetailWarehouseProducts, IWarehouseProductsPageable } from 'src/app/model/warehouse/warehouse';
import { ProductService } from 'src/app/services/product/product.service';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';

@Component({
  selector: 'app-select-product',
  templateUrl: './select-product.component.html',
  providers: [MessageService],
  styleUrls: ['./select-product.component.scss']
})
export class DetailSelectProductComponent  implements OnInit, OnDestroy {
  pageableData: IProductPage[];
  tableStructure: ColumnStructure[];
  gobalFilters;

  actions: any = [];

  createFormStructure: FormConfig;
  isVisibleCreate: boolean = false;
  formData: any;

  productCategoryList: any[] = [];
  categoryFilter: string = '';

  formGroup: FormGroup;
  submitted: boolean = false;


  constructor(private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder,
    private warehouseService: WarehouseService,
    private confirmationService: ConfirmationService,
  ) {

  }

  ngOnInit(): void {
     this.getProductPageableData();
     this.getProductCategoryCombo();
     this.buildPageStructure();

     this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }

  // @HostListener('window:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   if (event.ctrlKey && event.key === 'f') {
  //     event.preventDefault(); //Prevenimos la pantalla de impresión
  //     this.routeAddProductToDetail(); 
  //   }
  // }

  private getProductPageableData(params: any = { page: 0, size: 5 }) {
    let productObservable = this.warehouseService.getWarehouseProductsPageable(params);

    forkJoin([productObservable]).subscribe(
        ([warehouse]) => {
            this.pageableData = warehouse.data;
        }
    );
  }

  handleActionTriggered(event: { action: string, data: any }) {
    switch(event.action) {
      case 'get':
        this.getProduct(event.data);
        break;
      }
  }

  private getProductCategoryCombo() {
    this.productCategoryList = [];

      this.productCategoryList.push({name: 'Todas las categorías', id: ''});
      this.productCategoryList.push({name: 'Bebida', id: 'bebida'});
      this.productCategoryList.push({name: 'Almuerzo', id: 'almuerzo'});
      this.productCategoryList.push({name: 'Sándwich', id: 'sándwich'});
      this.productCategoryList.push({name: 'Empanada', id: 'empanada'});
  }

  getProduct(data: any) {
    this.confirmationService.confirm({
      message: `¿Agregar producto ${data.productName}?`,
      header: 'Agregar producto',
      icon: 'pi pi-check',
      accept: () => {
        sessionStorage.setItem("pName", data.productName);

        var completeDetail: IDetailWarehouseProducts[] = JSON.parse(sessionStorage.getItem('productDetail'))?.content ?? [];

        var newDetail: IDetailWarehouseProducts = {idProduct: data.idProduct, productName: data.productName, unitaryCost: data.unitaryCost, quantity: 1, totalDiscount: 0, totalPrice: 1*data.unitaryCost };
        completeDetail.push(newDetail);
        
        sessionStorage.setItem('productDetail', JSON.stringify({content: completeDetail, page: {totalElements: completeDetail.length, size:  10}}));

        this.router.navigate(['/dashboard/comercial-management/sales-panel']);
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  private buildPageStructure() {
    this.actions.unshift({icon: 'pi pi-check', class: 'p-button-success', actionName: 'get'})

    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'idProduct', value: 'idProduct', ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id'},
      {thead: 'Código', value: 'productCode', ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por código producto'},
      {thead: 'Producto', value: 'productName',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre producto'},
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('category', this.fb.control(''));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        this.categoryFilter = this.formGroup.value.category;

        let params = { category: this.categoryFilter};


        this.getProductPageableData(params);
    }
  }  

  onPageChange(event: any) {
    var getFilter = '';
    var categoryFilter = '';

    if (event.filters && event.filters.productName) {
        if (!!event.filters.productName[0].value || !!event.filters.productCode[0].value) {
            getFilter = event.filters.productName[0].value ?? event.filters.productCode[0].value;
        }
    }

    if(!!this.categoryFilter) {
        categoryFilter = this.categoryFilter;
    }

    let params = { page: event.page, size: event.rows , filter: getFilter, category: categoryFilter };

    this.getProductPageableData(params);
  }

 
    
}
