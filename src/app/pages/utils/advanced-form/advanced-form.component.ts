import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './advanced-form.component.html'
})
export class AdvancedFormComponent implements OnInit {
    @Input() formConfig: FormConfig;
    @Output() formSubmit: EventEmitter<any> = new EventEmitter();
  
    formGroup: FormGroup;
  
    constructor(private breadcrumbService: BreadcrumbService,
        private fb: FormBuilder, 
        private router: Router,
        private activeRoute: ActivatedRoute
    ) {
        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Form Layout'}
        ]);
    }

    ngOnInit(): void {
        this.formGroup = this.buildForm();
    }

    buildForm(): FormGroup {
        const group = this.fb.group({});
        this.formConfig = history.state.formConfig;

        this.formConfig.data.forEach(field => {
          group.addControl(
            field.formName,
            this.fb.control( (field.formValue ? field.formValue : ''), 
                Validators.required)
          );
        });
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
