import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';

@Component({
  selector: 'app-client-info',
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.scss']
})
export class ClientInfoComponent implements OnInit, OnDestroy {
  
  formGroup: FormGroup;

  buttonValue: string;

  clientName: string = '';

  constructor(private breadcrumbService: BreadcrumbService,
      private fb: FormBuilder, 
      private router: Router,
  ) {
      this.breadcrumbService.setItems([
          {label: 'Gestión'},
          {label: 'Detalle'}
      ]);
  }

  ngOnInit(): void {
      this.buttonValue = 'Aceptar'
      this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === ('Escape')) {
      this.redirectToSalesPanel();
    }
  }

  redirectToSalesPanel() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel']);
  }

  buildForm(): FormGroup {
      this.clientName = sessionStorage.getItem('clientName');

      const group = this.fb.group({});

        group.addControl('name', this.fb.control((!!this.clientName ? this.clientName : ''), [Validators.required, Validators.maxLength(60)]));

      return group;
    }
  
  submitForm() {
    if (this.formGroup.valid) {
      sessionStorage.setItem('clientName', this.formGroup.value.name);
      this.redirectToSalesPanel();
    }
  }

}
