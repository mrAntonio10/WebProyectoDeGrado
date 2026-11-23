import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ICreateDocument } from 'src/app/model/document/document';
import { DocumentService } from 'src/app/services/document/document.service';
import { PaymentFactoryService } from 'src/app/services/PaymentFactory/paymentFactory.service';
import { ICreateCharge } from 'src/app/model/PaymentFactory/paymentFactory';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PAYMENT_METHOD_CONFIG } from './config';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  providers: [MessageService],
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  buttonValue: string;

  config = PAYMENT_METHOD_CONFIG;
  selectedState = PAYMENT_METHOD_CONFIG.defaultPaymentMethod;
  states = PAYMENT_METHOD_CONFIG.paymentMethods;

  saleTotalPrice: number = 0;
  selectedRegion: string = 'SANTA_CRUZ';

  documentFormValue: ICreateDocument;
  paymentLink: SafeResourceUrl | null = null;
  qrGenerated: boolean = false;
  qrReferenceCode: string = '';

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private router: Router,
    private documentService: DocumentService,
    private messageService: MessageService,
    private paymentFactoryService: PaymentFactoryService,
    private sanitizer: DomSanitizer
  ) {
    this.breadcrumbService.setItems([
      { label: 'Rekids Tienda Online' },
      { label: 'Pago QR Online' }
    ]);

    this.documentFormValue = {
      totalDiscount: 0,
      totalPrice: 0,
      paymentMethod: 'QR',
      deliveryInformation: '',
      clientName: '',
      clientPhone: '',
      channel: 'ONLINE',
      region: 'SANTA_CRUZ',
      isInvoiced: false,
      detailList: []
    };
  }

  ngOnInit(): void {
    this.saleTotalPrice = Number(sessionStorage.getItem('totalPrice') || 0);
    this.selectedRegion = sessionStorage.getItem('selectedRegion') || 'SANTA_CRUZ';

    this.buttonValue = 'Confirmar Venta Online (Pago QR)';
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
    const savedName = sessionStorage.getItem('clientName') || '';
    const savedPhone = sessionStorage.getItem('clientPhone') || '';

    return this.fb.group({
      clientName: [savedName, [Validators.required, Validators.maxLength(60)]],
      clientPhone: [savedPhone, [Validators.required, Validators.maxLength(20)]],
      channel: [{ value: 'ONLINE', disabled: true }, [Validators.required]],
      paymentMethod: ['QR', [Validators.required]],
      totalPrice: [this.saleTotalPrice, [Validators.required]],
      totalDiscount: [0, [Validators.required]],
      isInvoiced: [false]
    });
  }

  onTotalDiscountChange(event: any) {
    const disc = Number(event?.target?.ariaValueNow || this.formGroup.value.totalDiscount || 0);
    const value = Math.max(0, this.saleTotalPrice - disc);
    this.formGroup.patchValue({ totalPrice: value });
  }

  submitForm() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos del Comprador Requeridos',
        detail: 'Ingresa tu Nombre y Número de teléfono para completar la compra online.'
      });
      return;
    }

    const clientName = this.formGroup.value.clientName.trim();
    const clientPhone = this.formGroup.value.clientPhone.trim();

    sessionStorage.setItem('clientName', clientName);
    sessionStorage.setItem('clientPhone', clientPhone);

    this.documentFormValue.clientName = clientName;
    this.documentFormValue.clientPhone = clientPhone;
    this.documentFormValue.channel = 'ONLINE';
    this.documentFormValue.region = this.selectedRegion;
    this.documentFormValue.deliveryInformation = `${clientName} | Tel: ${clientPhone} | ${this.selectedRegion}`;
    this.documentFormValue.detailList = JSON.parse(sessionStorage.getItem('productDetail'))?.content || [];
    this.documentFormValue.paymentMethod = 'QR';
    this.documentFormValue.totalDiscount = Number(this.formGroup.value.totalDiscount || 0);
    this.documentFormValue.totalPrice = Number(this.formGroup.value.totalPrice || this.saleTotalPrice);
    this.documentFormValue.isInvoiced = !!this.formGroup.value.isInvoiced;

    sessionStorage.setItem('formData', JSON.stringify({ ...this.documentFormValue, action: 'create' }));
    this.redirectToSalesPanel();
  }

  onGenerateQR() {
    this.qrReferenceCode = `${this.config.mockQrData.referencePrefix}${Date.now().toString().slice(-6)}`;

    const createCharge: ICreateCharge = {
      country: this.config.country,
      amount: this.formGroup.value.totalPrice?.toString(),
      currency: this.config.currency,
      idempotencyKey: `rekids-online-${Date.now()}`,
      chargeReason: `Compra Rekids Online (${this.selectedRegion}): ${this.formGroup.value.clientName || 'Comprador'}`,
      stereumJwt: localStorage.getItem('paymentJwt') || ''
    };

    this.paymentFactoryService.createCharge(createCharge).subscribe({
      next: (resp) => {
        const paymentUrl = resp?.data?.payment_link;
        if (paymentUrl) {
          this.paymentLink = this.sanitizer.bypassSecurityTrustResourceUrl(paymentUrl);
          window.open(paymentUrl, '_blank');
        }
        this.qrGenerated = true;
        this.messageService.add({
          severity: 'success',
          summary: 'QR Generado',
          detail: `Código QR listo por ${this.formGroup.value.totalPrice} BOB.`
        });
      },
      error: () => {
        // Fallback QR visual de config.ts cuando Stereum externo no está disponible
        this.qrGenerated = true;
        this.messageService.add({
          severity: 'success',
          summary: 'QR Rekids Generado',
          detail: `QR Simple generado (${this.qrReferenceCode}) por ${this.formGroup.value.totalPrice} BOB.`
        });
      }
    });
  }
}
