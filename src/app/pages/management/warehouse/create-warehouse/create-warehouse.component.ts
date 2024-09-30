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
  selector: 'app-create-warehouse',
  templateUrl: './create-warehouse.component.html',
  styleUrls: ['./create-warehouse.component.scss']
})
export class CreateWarehouseComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;

  enterpriseList: IEnterpriseState[] = [];
  branchOfficeList: IBranchOfficeState[] = [];
  productCategoryList : any[] = [];
  productList: IProductList[] = [];

  routeItems = [];

  buttonValue: string;
  
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

      
      this.routeItems = [
        {label: 'Personal', routerLink:'personal'},
        {label: 'Seat', routerLink:'seat'},
    ];
  }

  ngOnInit(): void {
      this.getProductCategoryCombo();
      this.getEnterpriseCombo();

      this.buttonValue = 'Asignar';

      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
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

  getProductCombo(event) {
    this.productList = [];  //seteamos

    let observableProductCategory = this.productService.getProductListByCategory(event.value);

    forkJoin([observableProductCategory]).subscribe(
      ([products]) => {
        console.log("tengooo", products.data);
        if(products.data.length > 0) {
          this.productList = products.data;
          this.productList.unshift({name: 'Seleccione  producto', id: '', category: ''});
        }
      }
    );
  }

  buildForm(): FormGroup {

      const group = this.fb.group({});

        group.addControl('idEnterprise', this.fb.control(''));
        group.addControl('idBranchOffice', this.fb.control((''), [Validators.required]));
        group.addControl('category', this.fb.control((''), [Validators.required]));
        group.addControl('idProduct', this.fb.control((''), [Validators.required]));
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

  private getProductCategoryCombo() {
    this.productCategoryList.push({name: 'Seleccione categoría', id: ''});
    this.productCategoryList.push({name: 'Almuerzo', id: 'almuerzo'});
    this.productCategoryList.push({name: 'Bebida', id: 'bebida'});
    this.productCategoryList.push({name: 'Sándwich', id: 'sándwich'});
    this.productCategoryList.push({name: 'Empanada', id: 'empanada'});
  }

}
