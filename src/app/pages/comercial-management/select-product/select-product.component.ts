import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IProductPage } from 'src/app/model/product/product';
import { IDetailWarehouseProducts, IWarehouseProductsPageable } from 'src/app/model/warehouse/warehouse';
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

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === ('Escape')) {
      this.redirectToSalesPanel();
    }
  }

  redirectToSalesPanel() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel']);
  }

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
        sessionStorage.setItem("pName", data.productName);

        var completeDetail: IDetailWarehouseProducts[] = JSON.parse(sessionStorage.getItem('productDetail'))?.content ?? [];

        var newDetail: IDetailWarehouseProducts = {idProduct: data.idProduct, productName: data.productName, sku: data.sku,unitaryCost: data.unitaryCost, quantity: 1, totalDiscount: 0, totalPrice: 1*data.unitaryCost };
       
        var checkIfExist = completeDetail.find(d => d.productName === newDetail.productName);
        
        if(checkIfExist) {
          this.messageService.add({severity: 'info', summary: 'Info', detail: 'El producto actualmente forma parte del detalle.', life: 5000  });
          sessionStorage.removeItem('pName');
        } else {
          completeDetail.push(newDetail);
        
          sessionStorage.setItem('productDetail', JSON.stringify({content: completeDetail, page: {totalElements: completeDetail.length, size:  10}}));
  
          let totalPricesCopy = [];
          completeDetail.forEach(c => {
            totalPricesCopy.push(c.totalPrice);
          });
          sessionStorage.setItem('totalPricesCopy', JSON.stringify(totalPricesCopy));
          
          this.redirectToSalesPanel();
        }
  }

  private buildPageStructure() {
    this.actions.unshift({icon: 'pi pi-check', class: 'p-button-text', actionName: 'get'})

    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false, width: '5rem'},
      {thead: 'idProduct', value: 'idProduct', ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id'},
      {thead: 'Código', value: 'sku', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por código producto', width: '3rem'},
      {thead: 'Producto', value: 'productName',ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nombre producto'},
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('category', this.fb.control(''));
      group.addControl('filter', this.fb.control((''),));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        this.categoryFilter = this.formGroup.value.category;
        let filter = this.formGroup.value.filter;

        let params = { category: this.categoryFilter, filter: filter};


        this.getProductPageableData(params);
    }
  }  

  onPageChange(event: any) {
    var getFilter = '';
    var categoryFilter = '';

    if (event.filters && event.filters.productName) {
        if (!!event.filters.productName[0].value || !!event.filters.sku[0].value) {
            getFilter = event.filters.productName[0].value ?? event.filters.sku[0].value;
        }
    }

    if(!!this.categoryFilter) {
        categoryFilter = this.categoryFilter;
    }

    if(sessionStorage.getItem('clear') === 'clear') {
      getFilter = '';
      categoryFilter = '';

      sessionStorage.removeItem('clear');
    }

    let params = { page: event.page, size: event.rows , filter: getFilter, category: categoryFilter };

    this.getProductPageableData(params);
  }

 
    
}
