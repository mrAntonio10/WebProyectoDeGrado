import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-branch-office',
  templateUrl: './create-branch-office.component.html',
})
export class CreateBranchOfficeComponent implements OnInit {

  formGroup: FormGroup;
  valToggle = false;
  
    constructor(private breadcrumbService: BreadcrumbService,
        private fb: FormBuilder, 
        private router: Router,
        private activeRoute: ActivatedRoute
    ) {
        this.breadcrumbService.setItems([
            {label: 'Gestión'},
            {label: 'Sucursales'}
        ]);
    }

    ngOnInit(): void {
        this.formGroup = this.buildForm();
    }

    buildForm(): FormGroup {
        const group = this.fb.group({});

          group.addControl('name', this.fb.control('', Validators.required));
          group.addControl('location', this.fb.control('', Validators.required));
          group.addControl('phoneNumber', this.fb.control('', Validators.required));
          group.addControl('idEnterprise', this.fb.control( sessionStorage.getItem('idEnterprise'), Validators.required));
          group.addControl('invoice', this.fb.control('', Validators.required));
          group.addControl('inCode', this.fb.control(''));

        return group;
      }
    
      submitForm() {
        if (this.formGroup.valid) {
            const fullPathData = sessionStorage.getItem('fullPath');
            sessionStorage.removeItem('fullPath');

                console.log("full path", fullPathData);
    
                sessionStorage.setItem('formData', JSON.stringify(this.formGroup.value));
                this.router.navigate([`/dashboard/${fullPathData}`]);
                
        }
    }

}
