import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { IWarehouse } from 'src/app/model/warehouse/warehouse';
import { WarehouseService } from 'src/app/services/warehouse/warehouse.service';

@Component({
  selector: 'app-edit-warehouse',
  templateUrl: './edit-warehouse.component.html',
  providers: [MessageService],
  styleUrls: ['./edit-warehouse.component.scss']
})
export class EditWarehouseComponent implements OnInit{
  
  formGroup: FormGroup;
  formValue: IWarehouse;

  constructor(private ref: DynamicDialogRef,
    private dConfig: DynamicDialogConfig,
    private fb: FormBuilder,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
  ) {

  }

  ngOnInit(): void {
    this.getWarehouseData(this.dConfig.data.idData);

  }

  private getWarehouseData(id) {
    let obsWarehouse = this.warehouseService.getWarehouseById(id);

    forkJoin([obsWarehouse]).subscribe({
      next: ([warehouse]) => {
        this.formValue = warehouse.data;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      },
      complete: () => {
        this.formGroup = this.buildForm();
      }
    });
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('productName', this.fb.control((this.formValue.product.name), [Validators.required]));
      group.addControl('productCategory', this.fb.control((this.formValue.product.category), [Validators.required]));
          

      group.addControl('id', this.fb.control((this.formValue.id), [Validators.required]));
      group.addControl('idBranchOffice', this.fb.control((this.formValue.branchOffice.id), [Validators.required]));
      group.addControl('idProduct', this.fb.control((this.formValue.product.id), [Validators.required]));
      group.addControl('minProduct', this.fb.control((this.formValue.minProduct), [Validators.required, Validators.min(1)]));
      group.addControl('maxProduct', this.fb.control((this.formValue.maxProduct), [Validators.required, Validators.min(1)]));
      group.addControl('stock', this.fb.control((this.formValue.stock), [Validators.required, Validators.min(1)]));
      group.addControl('unitaryCost', this.fb.control((this.formValue.unitaryCost), [Validators.required, Validators.min(1)]));

    return group;
  }

  submitForm() {
    sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: 'update'}));
    this.ref.close();
  }
}
