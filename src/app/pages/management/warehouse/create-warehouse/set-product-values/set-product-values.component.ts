import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { IBranchOfficeState } from 'src/app/model/branchOffice/branchOffice';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { IProductList } from 'src/app/model/product/product';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { ProductService } from 'src/app/services/product/product.service';

@Component({
  selector: 'app-set-product-values',
  templateUrl: './set-product-values.component.html',
  styleUrls: ['./set-product-values.component.scss']
})
export class SetProductValuesComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;

  enterpriseList: IEnterpriseState[] = [];
  branchOfficeList: IBranchOfficeState[] = [];

  buttonValue: string;

  productName: string;
  idProduct: string;
  
  constructor(private breadcrumbService: BreadcrumbService,
      private fb: FormBuilder, 
      private router: Router,
      private activeRoute: ActivatedRoute,
      private enterpriseService: EnterpriseService,
      private branchOfficeService: BranchOfficeService,
      private productService: ProductService
  ) {
      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Almacén'}
      ]);
  }

  ngOnInit(): void {
      this.getEnterpriseCombo();

      this.productName = sessionStorage.getItem("productName");
      this.idProduct = sessionStorage.getItem("idProduct");

      this.buttonValue = 'Asignar';

      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem("productName");
    sessionStorage.removeItem("idProduct");
  }

  private getEnterpriseCombo() {
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe(
      ([enterprises]) => {
        this.enterpriseList = enterprises.data;
        this.enterpriseList.unshift({name: 'Seleccione empresa', id: '', state: ''})
      }
    );
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

  buildForm(): FormGroup {

      const group = this.fb.group({});

        group.addControl('idEnterprise', this.fb.control(''));
        group.addControl('idBranchOffice', this.fb.control((''), [Validators.required]));
        group.addControl('idProduct', this.fb.control((this.idProduct), [Validators.required]));
        group.addControl('minProduct', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('maxProduct', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('stock', this.fb.control((''), [Validators.required, Validators.min(1)]));
        group.addControl('unitaryCost', this.fb.control((''), [Validators.required, Validators.min(1)]));

      return group;
    }
  
  submitForm() {
    if (this.formGroup.valid) {
        const fullPathData = sessionStorage.getItem('fullPath');
        sessionStorage.removeItem('fullPath');

            console.log("full path", fullPathData);

            sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: 'create'}));
            this.router.navigate([`/dashboard/${fullPathData}`]);
            
    }
  }


  prevPage() {
    this.router.navigate(['/dashboard/management/warehouse/create/product']);
}

}

