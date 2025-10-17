import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ICreateDocument } from 'src/app/model/document/document';
import { DocumentService } from 'src/app/services/document/document.service';
import { PaymentIntegrationService } from 'src/app/services/paymentIntegration/paymentIntegration.service';
import { PaymentFactoryService } from 'src/app/services/PaymentFactory/paymentFactory.service';
import { ICreateCharge } from 'src/app/model/PaymentFactory/paymentFactory';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  providers: [MessageService],
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;

  buttonValue: string;

  selectedState = 'EFECTIVO';
  states = [
    { name: 'Efectivo', code: 'EFECTIVO' },
    { name: 'Qr', code: 'QR' },
    { name: 'Tarjeta', code: 'TARJETA' },
  ];

  saleTotalPrice;

  documentFormValue: ICreateDocument;
  paymentLink: SafeResourceUrl | null = null;

  constructor(private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder,
    private router: Router,
    private documentService: DocumentService,
    private messageService: MessageService,
    private paymentFactoryService: PaymentFactoryService,
    private sanitizer: DomSanitizer
  ) {
    this.breadcrumbService.setItems([
      { label: 'Gestión' },
      { label: 'Detalle' }
    ]);

    this.documentFormValue = {
      totalDiscount: 0,
      totalPrice: 0,
      paymentMethod: '',
      deliveryInformation: '',
      detailList: []
    };

    let paymentJwt = localStorage.getItem('paymentJwt');

    if (paymentJwt == null || paymentJwt == "") {
      paymentFactoryService.getAuthPaymentJwt().subscribe({
        next: (resp) => {
          localStorage.setItem('paymentJwt', resp.data.token);
        },
        complete: () => {
        }
      })
    } else {
    }
  }

  ngOnInit(): void {
    this.saleTotalPrice = sessionStorage.getItem('totalPrice');

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

    const group = this.fb.group({});

    group.addControl('totalPrice', this.fb.control((this.saleTotalPrice), [Validators.required]));
    group.addControl('totalDiscount', this.fb.control((0), [Validators.required]));
    group.addControl('paymentMethod', this.fb.control(('EFECTIVO'), [Validators.required]));

    group.addControl('amount', this.fb.control((''),));
    group.addControl('exchange', this.fb.control((''),));

    return group;
  }

  onTotalDiscountChange(event) {
    let value = this.saleTotalPrice - event.target.ariaValueNow;
    this.formGroup.patchValue({ totalPrice: value });
  }

  onAmountChange(event) {
    let value = event.target.ariaValueNow - this.formGroup.value.totalPrice;
    this.formGroup.patchValue({ exchange: value });
  }

  submitForm() {
    if (this.formGroup.valid) {

      this.documentFormValue.deliveryInformation = sessionStorage.getItem('clientName');
      this.documentFormValue.detailList = JSON.parse(sessionStorage.getItem('productDetail'))?.content;
      this.documentFormValue.paymentMethod = this.formGroup.value.paymentMethod;
      this.documentFormValue.totalDiscount = this.formGroup.value.totalDiscount;
      this.documentFormValue.totalPrice = this.formGroup.value.totalPrice;

      sessionStorage.setItem('formData', JSON.stringify({ ...this.documentFormValue, action: 'create' }))

      this.redirectToSalesPanel();
    }
  }

  onGenerateQR() {
    const createCharge: ICreateCharge = {
      country: 'BO', // fijo, o puedes obtenerlo dinámico si lo manejas en tu app
      amount: this.formGroup.value.totalPrice?.toString(), // convierto a string
      currency: 'BOB',
      idempotencyKey: localStorage.getItem('email') + `-${Date.now()}`, // para que sea único
      chargeReason: 'Pago:' + sessionStorage.getItem('email'),
      stereumJwt: localStorage.getItem('paymentJwt')
    };

    console.log('[GENERAR QR] Payload ->', createCharge);

    this.paymentFactoryService.createCharge(createCharge).subscribe({
      next: (resp) => {
        console.log("XDDD ", resp);
        this.paymentLink = this.sanitizer.bypassSecurityTrustResourceUrl(resp.data.payment_link);
        const paymentUrl = resp?.data?.payment_link;
        if (paymentUrl) {
          window.open(paymentUrl, '_blank'); // 👈 abre en nueva pestaña
        }
      },
      complete: () => {

      }
    })
  }
}