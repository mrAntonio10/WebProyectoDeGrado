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
import { ICreateWarehouse, IUpdateWarehouse, IWarehousePaged } from 'src/app/model/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { ICreateProduct } from 'src/app/model/product/product';
import { ProductService } from 'src/app/services/product/product.service';
import { EditWarehouseComponent } from './edit-warehouse/edit-warehouse.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ReportService } from 'src/app/services/report/report.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  productCategoryList: any = [];
  limitList: any = [];

  formGroup: FormGroup;
  idBranchOfficeFilter : string;
  categoryFilter: string;
  limitFilter: string;


  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private enterpriseService: EnterpriseService,
    private branchOfficeService: BranchOfficeService,
    private productService: ProductService,
    private dialogService: DialogService,
    private reportService: ReportService,
  ) {

  }

  ngOnInit(): void {

     this.getWarehousePermissions();
     this.getWarehousePageableData();

     this.formGroup = this.buildForm();

     this.getEnterpriseCombo();
     this.getProductCategoryCombo();
     this.getLimitCombo();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (this?.formData?.action === 'create-product') this.submitCreateProduct(this.formData);
     if (this?.formData?.action === 'create') this.submitCreateProductWarehouse(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateProductWarehouse(this.formData);

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
              this.actions.unshift({icon: 'pi pi-trash', class: 'p-button-danger', actionName: 'block'})
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
        this.buildEditWarehouseProduct(event.data);
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

  buildCreateProduct() {
    this.activatedRoute.url.subscribe(urlSegments => {
      const fullPath = urlSegments.map(segment => segment.path).join('/');
      sessionStorage.setItem('fullPath', fullPath);

     this.router.navigate(['/dashboard/management/warehouse/create-product']);
    });
  }

  generateOutStocksPDFReport() {
    this.idBranchOfficeFilter = this.formGroup.value.idBranchOffice;
    this.categoryFilter = this.formGroup.value.category;

    let params = { page: 0, size: 1000, idBranchOffice: this.idBranchOfficeFilter, category: this.categoryFilter, limit: 'min' };

    let observablePdfReport = this.reportService.getOutStocksPDFReport(params);
    forkJoin([observablePdfReport]).subscribe({
      next: ([response]) => {
        var blob = this.b64toBlob(response.data.base64, "application/pdf");
        let a = document.createElement("a");
        document.body.appendChild(a);
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        // a.target = "_blank";
        a.download = "reporte.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

  public b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
  
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
  
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
  
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
  
        var byteArray = new Uint8Array(byteNumbers);
  
        byteArrays.push(byteArray);
    }
  
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  buildEditWarehouseProduct(data: any) {
    const ref = this.dialogService.open(EditWarehouseComponent, {
      header: 'Actualizar registro - Sucursal: '+data.branchOfficeName,
      width: '70%',
      data: {idData: data.id}
    });

    ref.onClose.subscribe({
      next: () => {
        this.ngOnInit();
      }
    });
  }

  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id', ttype: 'text', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Producto', value: 'productName',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre producto'},
      {thead: 'Categoría', value: 'category', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por categoría'},
      {thead: 'Precio unitario', value: 'unitaryCost', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Buscar por Precio'},
      {thead: 'Stock', value: 'stock', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por stock'},
      {thead: 'Nivel', value: 'stockState', ttype: 'verified', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nivel'},
      {thead: 'Min', value: 'min', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por límite mínimo'},
      {thead: 'Max', value: 'max', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Buscar por límite máximo'},
      {thead: 'Sucursal', value: 'branchOfficeName', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por sucursal'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  private getEnterpriseCombo() {
    this.enterpriseList = [];
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe({
      next: ([enterprises]) => {
        this.enterpriseList = enterprises.data;
      },
      complete: () => {
        if(this.enterpriseList.length == 1 ) {
          this.formGroup.get('idEnterprise').setValue(this.enterpriseList[0].id);

          let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(this.formGroup.value.idEnterprise);

          forkJoin([observableBranchOfficeList]).subscribe(
            ([branchOffices]) => {
              this.branchOfficeList = branchOffices.data;
              if(!!this.branchOfficeList) {
                this.branchOfficeList.unshift({name: 'Todas las sucursales', id: '', state: ''});
              }
            }
          );
        } else {
          this.enterpriseList.unshift({name: 'Todas las empresas', id: '', state: ''});
        }
      }
    });
  }

  getBranchOfficeCombo(event) {
    this.branchOfficeList = [];

    let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(event.value);

    forkJoin([observableBranchOfficeList]).subscribe(
      ([branchOffices]) => {
        this.branchOfficeList = branchOffices.data;
        if(!!this.branchOfficeList) {
          this.branchOfficeList.unshift({name: 'Todas las sucursales', id: '', state: ''});
        }
      }
    );
  }

  private getProductCategoryCombo() {
    this.productCategoryList = [];

      this.productCategoryList.push({name: 'Todas las categorías', id: ''});
      this.productCategoryList.push({name: 'Bebida', id: 'bebida'});
      this.productCategoryList.push({name: 'Salado', id: 'salado'});
      this.productCategoryList.push({name: 'Sándwich', id: 'sándwich'});
      this.productCategoryList.push({name: 'Dulce', id: 'dulce'});
  }

  private getLimitCombo() {
    this.limitList = [];

    this.limitList.push({name: 'Todos', id: ''});
    this.limitList.push({name: 'Reporte de quiebre', id: 'min'});
}

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('idEnterprise', this.fb.control(''));
      group.addControl('idBranchOffice', this.fb.control(''));
      group.addControl('category', this.fb.control(''));
      group.addControl('limit', this.fb.control(''));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        this.idBranchOfficeFilter = this.formGroup.value.idBranchOffice;
        this.categoryFilter = this.formGroup.value.category;
        this.limitFilter = this.formGroup.value.limit;

        let params = { idBranchOffice: this.idBranchOfficeFilter, category: this.categoryFilter, limit: this.limitFilter };

        this.getWarehousePageableData(params);
    }
  }  

  onPageChange(event: any) {
    var getFilter = '';
    var branchOfficeFilter = '';
    var categoryFilter = '';
    var limitFilter = '';

    if (event.filters && event.filters.productName) {
        if (!!event.filters.productName[0].value) {
            getFilter = event.filters.productName[0].value;
        }
    }
    if(!!this.idBranchOfficeFilter) {
      branchOfficeFilter = this.idBranchOfficeFilter;
    }
    if(!!this.categoryFilter) {
      categoryFilter = this.categoryFilter;
    }
    if(!!this.limitFilter) {
      limitFilter = this.limitFilter;
    }
    console.log("Limpiandoooo",sessionStorage.getItem('clear') );

    if(sessionStorage.getItem('clear') === 'clear') {
      branchOfficeFilter = '';
      categoryFilter = '';
      limitFilter = '';

      sessionStorage.removeItem('clear');
    }

    let params = { page: event.page, size: event.rows , filter: getFilter, idBranchOffice: branchOfficeFilter, category: categoryFilter, limit: limitFilter};

    this.getWarehousePageableData(params);
  }

  submitCreateProduct(submittedData: ICreateProduct) {
    let createObservable = this.productService.createProduct(submittedData);

    forkJoin([createObservable]).subscribe({
      next:  ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto creado exitosamente.' });
        this.ngOnInit(); 
      }, 
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    }
    )
  }

  submitCreateProductWarehouse(submittedData: ICreateWarehouse) {
    let createObservable = this.warehouseService.createWarehouse(submittedData);

    forkJoin([createObservable]).subscribe({
      next:  ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto registrado exitosamente.' });
      }, 
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      },
      complete: () => {
         this.getWarehousePageableData();
      }
    }
    )
  }

  submitUpdateProductWarehouse(submittedData: IUpdateWarehouse) {
    let updateObservable = this.warehouseService.updateWarehouse(submittedData);
    console.log("UPDATE WAREHOUSE WITH - ", submittedData)
    forkJoin([updateObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto almacén actualizado exitosamente.' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      },
      complete: () => {
        this.getWarehousePageableData();
      }
    }
    )
  }

}
