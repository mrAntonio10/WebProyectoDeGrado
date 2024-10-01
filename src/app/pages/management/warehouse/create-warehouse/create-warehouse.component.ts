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
export class CreateWarehouseComponent {
  routeItems = [];

  buttonValue: string;
  
  constructor(private breadcrumbService: BreadcrumbService,
  ) {

    this.buttonValue = "Asignar";

      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Almacén'}
      ]);

      
      this.routeItems = [
        {label: 'Producto', routerLink:'product'},
        {label: 'Valores', routerLink:'value'},
    ];
  }

}
