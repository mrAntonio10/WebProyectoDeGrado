import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './advanced-form.component.html'
})
export class AdvancedFormComponent implements OnInit, OnDestroy {
    formConfig: FormConfig;
    @Output() formSubmit: EventEmitter<any> = new EventEmitter();
  
    formGroup: FormGroup;

    formValue;

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
        private activeRoute: ActivatedRoute
    ) {
        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Form Layout'}
        ]);
    }

    ngOnInit(): void {
        this.formGroup = this.buildDinamicForm();
    }

    ngOnDestroy(): void {
            localStorage.removeItem('dinamicFormConfig');
            sessionStorage.removeItem('fullPath');
    }

    buildDinamicForm(): FormGroup {
        this.componentBehaviour = JSON.parse(localStorage.getItem('dinamicFormConfig')).action;
        (this.componentBehaviour === 'update' ? this.buttonValue = 'Actualizar' : this.buttonValue = 'Crear');

        const group = this.fb.group({});
        this.formConfig = JSON.parse(localStorage.getItem('dinamicFormConfig')); 

        this.formConfig.data.forEach(field => {
            const fieldValidators = (field.validators || []).map(val => {
                switch (val.name) {
                  case 'required':
                    return Validators.required;
                    break;
                  case 'maxLength':
                    return Validators.maxLength(val.args);
                    break;
                  case 'email':
                    return Validators.email;
                    break;
                  case 'pattern':
                    return Validators.pattern(val.args);
                    break;
                    case 'max':
                    return Validators.max(val.args);
                  default:
                    return null;
                }
              }).filter(v => v !== null);
            
          group.addControl(
            field.formName,
            this.fb.control(
                (field.formValue ? field.formValue : ''),
                fieldValidators
            )
          );
        });

        return group;
      }
    
      submitForm() {
        if (this.formGroup.valid) {
            const fullPathData = sessionStorage.getItem('fullPath');

                sessionStorage.setItem('formData', JSON.stringify({...this.formGroup.value, action: this.componentBehaviour}));
                this.router.navigate([`/dashboard/${fullPathData}`]);
                
        }
    }
}
