import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CLIENT_INFO_CONFIG } from './config';

@Component({
  selector: 'app-client-info',
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.scss']
})
export class ClientInfoComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  buttonValue: string;

  clientName: string = '';
  clientPhone: string = '';
  selectedRegion: string = '';
  config = CLIENT_INFO_CONFIG;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.breadcrumbService.setItems([
      { label: 'Rekids Tienda Online' },
      { label: 'Datos del Comprador' }
    ]);
  }

  ngOnInit(): void {
    this.buttonValue = 'Guardar Datos del Comprador';
    this.selectedRegion = sessionStorage.getItem('selectedRegion') || 'SANTA_CRUZ';
    this.formGroup = this.buildForm();
  }

  ngOnDestroy(): void {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.redirectToSalesPanel();
    }
  }

  redirectToSalesPanel() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel']);
  }

  buildForm(): FormGroup {
    this.clientName = sessionStorage.getItem('clientName') || '';
    this.clientPhone = sessionStorage.getItem('clientPhone') || '';

    return this.fb.group({
      name: [this.clientName, [Validators.required, Validators.maxLength(this.config.maxNameLength)]],
      phone: [this.clientPhone, [Validators.required, Validators.maxLength(this.config.maxPhoneLength)]],
      channel: [{ value: this.config.defaultChannel, disabled: true }],
      paymentMethod: [{ value: this.config.defaultPaymentMethod, disabled: true }]
    });
  }

  fillDemoBuyer() {
    this.formGroup.patchValue({
      name: this.config.mockClient.name,
      phone: this.config.mockClient.phone
    });
  }

  submitForm() {
    if (this.formGroup.valid) {
      sessionStorage.setItem('clientName', this.formGroup.value.name);
      sessionStorage.setItem('clientPhone', this.formGroup.value.phone);
      this.redirectToSalesPanel();
    }
  }
}
