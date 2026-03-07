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

  productCategoryList: any[] = [];

  buttonValue: string;

  constructor(private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {
    this.breadcrumbService.setItems([
      { label: 'Gestión' },
      { label: 'Almacén' }
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
    group.addControl('category', this.fb.control(('salado'), [Validators.required, Validators.maxLength(30)]));
    group.addControl('beverageFormat', this.fb.control((''), [Validators.maxLength(30)]));
    group.addControl('sku', this.fb.control((''), [Validators.required, Validators.maxLength(6)]));
    group.addControl('photo', this.fb.control(('')));

    return group;
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Guarda todo el data:image/...;base64,...
        this.formGroup.patchValue({
          photo: reader.result as string
        });
      };
    }
  }

  submitForm() {
    if (this.formGroup.valid) {
      const fullPathData = sessionStorage.getItem('fullPath');
      sessionStorage.removeItem('fullPath');

      console.log("full path", fullPathData);

      sessionStorage.setItem('formData', JSON.stringify({ ...this.formGroup.value, action: 'create-product' }));
      this.router.navigate([`/dashboard/${fullPathData}`]);

    }
  }

  private getProductCategoryCombo() {
    this.productCategoryList.push({ name: 'Salado', id: 'salado' });
    this.productCategoryList.push({ name: 'Bebida', id: 'bebida' });
    this.productCategoryList.push({ name: 'Sándwich', id: 'sándwich' });
    this.productCategoryList.push({ name: 'Dulce', id: 'dulce' });
    this.productCategoryList.push({ name: 'Café', id: 'café' });
    this.productCategoryList.push({ name: 'Té', id: 'té' });
    this.productCategoryList.push({ name: 'Jugo', id: 'jugo' });
    this.productCategoryList.push({ name: 'Postre', id: 'postre' });
    this.productCategoryList.push({ name: 'Panadería', id: 'panadería' });
    this.productCategoryList.push({ name: 'Snack', id: 'snack' });
  }

}
