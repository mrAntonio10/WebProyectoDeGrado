import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IProductPage } from 'src/app/model/product/product';
import { ProductService } from 'src/app/services/product/product.service';

@Component({
  selector: 'app-select-product',
  templateUrl: './select-product.component.html',
  providers: [MessageService],
  styleUrls: ['./select-product.component.scss']
})
export class SelectProductComponent  implements OnInit, OnDestroy {
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
  idProduct: string;

  constructor(private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder,
    private productService: ProductService,
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

  private getProductPageableData(params: any = { page: 0, size: 5 }) {
    let productObservable = this.productService.getProductPageable(params);

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
      message: `¿Agregar producto ${data.name} al almacén?`,
      header: 'Agregar producto',
      icon: 'pi pi-check',
      accept: () => {
        console.log(`Producto con ID ${data.id} agregado`);
        this.idProduct = data.id;
        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: `Producto ${data.name}, seleccionado.` });
        sessionStorage.setItem("idProduct", data.id);
        sessionStorage.setItem("productName", data.name);
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  nextPage() {
    if (!!this.idProduct) {
        this.submitted = true;

        this.router.navigate(['/dashboard/management/warehouse/create/value']);
        return;

    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un producto primero.' });
    }

}

  private buildPageStructure() {
    this.actions.unshift({icon: 'pi pi-check', class: 'p-button-success', actionName: 'get'})

    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id', ttype: 'text', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Producto', value: 'name',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre producto'},
      {thead: 'Categoría', value: 'category', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por categoría'},
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

    if (event.filters && event.filters.name) {
        if (!!event.filters.name[0].value) {
            getFilter = event.filters.name[0].value;
        }
    }

    if(!!this.categoryFilter) {
        categoryFilter = this.categoryFilter;
    }

    let params = { page: event.page, size: event.rows , filter: getFilter, category: categoryFilter };

    this.getProductPageableData(params);
  }

 
    
}
