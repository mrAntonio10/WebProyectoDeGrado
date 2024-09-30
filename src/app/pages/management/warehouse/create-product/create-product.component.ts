import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ICreateProduct } from 'src/app/model/product/product';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;

  productCategoryList : any[] = [];

  buttonValue: string;
  
  constructor(private breadcrumbService: BreadcrumbService,
      private fb: FormBuilder, 
      private router: Router,
      private activeRoute: ActivatedRoute,
  ) {
      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Almacén'}
      ]);
  }

  ngOnInit(): void {
      this.getProductCategoryCombo();

      this.buttonValue = 'Crear';

      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
  }

  buildForm(): FormGroup {

      const group = this.fb.group({});

        group.addControl('id', this.fb.control(('')));
        group.addControl('name', this.fb.control((''), [Validators.required, Validators.maxLength(60)]));
        group.addControl('category', this.fb.control(('almuerzo'), [Validators.required, Validators.maxLength(30)]));
        group.addControl('beverageFormat', this.fb.control((''), [Validators.maxLength(30)]));

      return group;
    }
  
  submitForm() {
    if (this.formGroup.valid) {
        const fullPathData = sessionStorage.getItem('fullPath');
        sessionStorage.removeItem('fullPath');

            console.log("full path", fullPathData);

            sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: 'create-product'}));
            this.router.navigate([`/dashboard/${fullPathData}`]);
            
    }
  }

  private getProductCategoryCombo() {
    this.productCategoryList.push({name: 'Almuerzo', id: 'almuerzo'});
    this.productCategoryList.push({name: 'Bebida', id: 'bebida'});
    this.productCategoryList.push({name: 'Sándwich', id: 'sándwich'});
    this.productCategoryList.push({name: 'Empanada', id: 'empanada'});
  }

}
