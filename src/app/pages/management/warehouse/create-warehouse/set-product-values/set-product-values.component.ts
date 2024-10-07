import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { empty, forkJoin, isEmpty } from 'rxjs';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { IBranchOfficeState } from 'src/app/model/branchOffice/branchOffice';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { IProductList } from 'src/app/model/product/product';
import { IWarehouse } from 'src/app/model/warehouse/warehouse';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { ProductService } from 'src/app/services/product/product.service';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';

@Component({
  selector: 'app-set-product-values',
  templateUrl: './set-product-values.component.html',
  providers: [MessageService],
  styleUrls: ['./set-product-values.component.scss']
})
export class SetProductValuesComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  warehouseProductValue: IWarehouse;

  enterpriseList: IEnterpriseState[] = [];
  branchOfficeList: IBranchOfficeState[] = [];

  buttonValue: string;

  productName: string;
  idProduct: string;

  pName: string;
  beverageFormat: string = 'empty';
  
  constructor(private breadcrumbService: BreadcrumbService,
      private fb: FormBuilder, 
      private router: Router,
      private enterpriseService: EnterpriseService,
      private branchOfficeService: BranchOfficeService,
      private messageService: MessageService,
      private warehouseService: WarehouseService,
  ) {
      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Almacén'}
      ]);
  }

  ngOnInit(): void {
      this.productName = sessionStorage.getItem("productName");
      this.idProduct = sessionStorage.getItem("idProduct");
      
      this.pName = sessionStorage.getItem("pName");
      if(!!sessionStorage.getItem("beverageFormat")) {
        this.beverageFormat = sessionStorage.getItem("beverageFormat");
      }
      this.getEnterpriseCombo();

      this.buttonValue = 'Asignar';

      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem("productName");
    sessionStorage.removeItem("idProduct");
  }

  private getEnterpriseCombo() {
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe({
      next:  ([enterprises]) => {
        this.enterpriseList = enterprises.data;       
        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: `Producto ${this.productName}, seleccionado.` });
      },
      complete: () => {
        if(this.enterpriseList.length == 1 ) {
          this.formGroup.get('idBranchOffice').setValue(this.enterpriseList[0].id);

          let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(this.formGroup.value.idBranchOffice);

          forkJoin([observableBranchOfficeList]).subscribe(
            ([branchOffices]) => {
              this.branchOfficeList = branchOffices.data;
              if(!!this.branchOfficeList) {
                this.branchOfficeList.unshift({name: 'Seleccione  sucursal', id: '', state: ''})
              }
            }
          );
        } else {
          this.enterpriseList.unshift({name: 'Seleccione empresa', id: '', state: ''});
        }
      }
    });
  }

  getBranchOfficeCombo(event) {
    let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(event.value);

    forkJoin([observableBranchOfficeList]).subscribe(
      ([branchOffices]) => {
        this.branchOfficeList = branchOffices.data;
        this.branchOfficeList.unshift({name: 'Seleccione  sucursal', id: '', state: ''})
      }
    );
  }

  onBranchOfficeChange(event) {
    let observableWarehouseProduct = this.warehouseService.getWarehouseByIdBranchOfficeProductNameAndBeverageFormat(event.value, this.pName, this.beverageFormat);

    forkJoin([observableWarehouseProduct]).subscribe({
      next: ([resp]) => {
        console.log("Existe un producto en almacen", resp);

        this.warehouseProductValue = resp.data;
        if(!!this.warehouseProductValue) {
          this.formGroup.get('actualStock').setValue(this.warehouseProductValue?.stock);
          this.formGroup.get('minProduct').setValue(this.warehouseProductValue?.minProduct);
          this.formGroup.get('maxProduct').setValue(this.warehouseProductValue?.maxProduct);
          this.formGroup.get('unitaryCost').setValue(this.warehouseProductValue?.unitaryCost);

          this.formGroup.get('id').setValue(this.warehouseProductValue?.id);
          this.buttonValue = "Actualizar";
        }
      },
      error: (err) => {
          this.formGroup.get('actualStock').setValue('');
          this.formGroup.get('minProduct').setValue('');
          this.formGroup.get('maxProduct').setValue('');
          this.formGroup.get('unitaryCost').setValue('');

          this.formGroup.get('id').setValue('');
          this.buttonValue = "Asignar";
      }
    })
  }

  buildForm(): FormGroup {
      const group = this.fb.group({});
        group.addControl('id', this.fb.control(''));

        group.addControl('idEnterprise', this.fb.control(''));
        group.addControl('idBranchOffice', this.fb.control((''), [Validators.required]));
        group.addControl('idProduct', this.fb.control((this.idProduct), [Validators.required]));
        group.addControl('minProduct', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('maxProduct', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('actualStock', this.fb.control(('0')));
        group.addControl('stock', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('unitaryCost', this.fb.control((''), [Validators.required, Validators.min(1)]));

      return group;
    }
  
  submitForm() {
    if (this.formGroup.valid) {
        const fullPathData = sessionStorage.getItem('fullPath');

        this.formGroup.get('stock').setValue(this.formGroup.value.actualStock + this.formGroup.value.stock);

        sessionStorage.removeItem('fullPath');

            console.log("full path", fullPathData);

            if(this.buttonValue === 'Asignar') {
              sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: 'create'}));
            } else {
              sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: 'update'}));
            }
            this.router.navigate([`/dashboard/${fullPathData}`]);
            
    }

  }


  prevPage() {
    this.router.navigate(['/dashboard/management/warehouse/create/product']);
}

}

