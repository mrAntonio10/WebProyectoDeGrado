import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { IBranchOffice } from 'src/app/model/branchOffice/branchOffice';
import { IEnterpriseState } from 'src/app/model/enterprise/enterprise';
import { forkJoin } from 'rxjs';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';

@Component({
  selector: 'app-create-branch-office',
  templateUrl: './create-branch-office.component.html',
})
export class CreateBranchOfficeComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  formValue: IBranchOffice;

  enterpriseList : IEnterpriseState[];
  valToggle = false;

  buttonValue: string;
  componentBehaviour: string;

  selectedState = null;
  states = [
    {name: 'Activa', code: 'ACTIVE'},
    {name: 'Bloqueada', code: 'BLOCKED'},
    {name: 'Eliminada', code: 'DELETED'},
  ];
  
  constructor(private breadcrumbService: BreadcrumbService,
      private fb: FormBuilder, 
      private router: Router,
      private activeRoute: ActivatedRoute,
      private enterpriseService: EnterpriseService
  ) {
      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Sucursales'}
      ]);
  }

  ngOnInit(): void {
      this.getEnterpriseCombo();

      this.formValue = JSON.parse(localStorage.getItem('dinamicFormConfig'));
      this.componentBehaviour = JSON.parse(localStorage.getItem('dinamicFormConfig')).action;

      (this.componentBehaviour === 'update' ? this.buttonValue = 'Actualizar' : this.buttonValue = 'Crear');

      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
    localStorage.removeItem('dinamicFormConfig');
  }

  buildForm(): FormGroup {
      this.selectedState = this.formValue?.state;

      const group = this.fb.group({});

        group.addControl('id', this.fb.control((!!this.formValue?.id ? this.formValue?.id : '')));
        group.addControl('name', this.fb.control((!!this.formValue?.name ? this.formValue?.name : ''), [Validators.required, Validators.maxLength(120)]));
        group.addControl('location', this.fb.control((!!this.formValue?.location ? this.formValue?.location : ''), Validators.required));
        group.addControl('phoneNumber', this.fb.control((!!this.formValue?.phoneNumber ? this.formValue?.phoneNumber : ''), [Validators.required, Validators.pattern('^[\\d]*$'), Validators.maxLength(20)]));
        group.addControl('idEnterprise', this.fb.control(!!this.formValue?.enterprise?.id ? this.formValue?.enterprise.id : ''));
        group.addControl('invoice', this.fb.control((!!this.formValue?.invoice ? this.valToggle = this.formValue?.invoice : ''), Validators.required));
        group.addControl('inCode', this.fb.control((!!this.formValue?.inCode ? this.formValue?.inCode : '')));
        group.addControl('state', this.fb.control((!!this.formValue?.state ? this.selectedState : '')));

      return group;
    }
  
  submitForm() {
    if (this.formGroup.valid) {
        const fullPathData = sessionStorage.getItem('fullPath');
        sessionStorage.removeItem('fullPath');

            console.log("full path", fullPathData);

            sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: this.componentBehaviour}));
            this.router.navigate([`/dashboard/${fullPathData}`]);
            
    }
  }

  private getEnterpriseCombo() {
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe(
      ([enterprises]) => {
        this.enterpriseList = enterprises.data;
      }
    );
  }

}
