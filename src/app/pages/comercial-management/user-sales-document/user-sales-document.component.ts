import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { ISalesUserDocumet } from 'src/app/model/document/document';
import { IEnterprisePage } from 'src/app/model/enterprise/enterprise';
import { DocumentService } from 'src/app/services/document/document.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { SalesDocumentInfoComponent } from '../sales-document-info/sales-document-info.component';
import { ReportService } from 'src/app/services/report/report.service';

@Component({
  selector: 'app-user-sales-document',
  templateUrl: './user-sales-document.component.html',
  providers: [MessageService, DatePipe],
  styleUrls: ['./user-sales-document.component.scss']
})
export class UserSalesDocumentComponent implements OnInit, OnDestroy {

  pageableData: ISalesUserDocumet;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  isVisibleCreate: boolean = null;
  actions: any = [];

  date: Date = new Date;
  selectedState = '';
  states = [
    {name: 'Todos los métodos de pago', code: ''},
    {name: 'Efectivo', code: 'Efectivo'},
    {name: 'Qr', code: 'Qr'},
    {name: 'Tarjeta', code: 'Tarjeta'},
  ];

  formGroup: FormGroup;

  constructor(private documentService: DocumentService,
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private primengConfig: PrimeNGConfig,
    private datePipe: DatePipe,
    private dialogService: DialogService,
    private messageService: MessageService,
    private reportService: ReportService
  ) {

  }

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      today: 'Hoy',
      clear: 'Borrar',
      dateFormat: 'dd-MM-yy',
    });

    this.getSalesUserDocumentPermissions();
    this.formGroup = this.buildForm();
    this.buildPageStructure();
  }

  ngOnDestroy(): void {
  }

  private getSalesUserDocumentPageableData(params: any = { page: 0, size: 5 }) {
    let salesUserDocObservable = this.documentService.getSalesUserDocumentPageable(params);

    forkJoin([salesUserDocObservable]).subscribe(
        ([documents]) => {
            this.pageableData = documents.data;
        }
    );
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('date', this.fb.control((this.date)));
      group.addControl('paymentMethod', this.fb.control(('')));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
      this.date = this.formGroup.value.date;
      
        let d = this.datePipe.transform(this.formGroup.value.date, 'dd/MM/yyyy');
        let f = this.formGroup.value.paymentMethod;

        let params = { date: d, filter: f };

        this.getSalesUserDocumentPageableData(params);
    }
  } 

  handleActionTriggered(event: { action: string, data: IEnterprisePage }) {
    switch(event.action) {
      case 'info':
        this.viewSalesDocumentInfoDialog(event.data.id);
        break;
      }
  }

  getSalesUserDocumentPermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/user-sales");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        console.log("PERMISOS ", permission.data);
        this.actions = [];

        permission.data.forEach(permission => {          
          switch (permission.permissionName) {
            case 'VIEW':
              this.getSalesUserDocumentPageableData();
              this.actions.unshift({icon: 'pi pi-eye', class: 'p-button-warning', actionName: 'info'});
              break;
          }
        });
      }
    )
  }

  private viewSalesDocumentInfoDialog(id: string) {
    const ref = this.dialogService.open(SalesDocumentInfoComponent, {
      width: '70%',
      height: '95%',
      data: {idDocument: id}
    });

    ref.onClose.subscribe({
      next: () => {
      }
    });
  }

  generatesalesPDFReport() {
      this.date = this.formGroup.value.date;
      
        let d = this.datePipe.transform(this.formGroup.value.date, 'dd/MM/yyyy');
        let f = this.formGroup.value.paymentMethod;

        let params = { date: d, filter: f };

    let observablePdfReport = this.reportService.getuserSalesPDFReport(params);
    forkJoin([observablePdfReport]).subscribe({
      next: ([response]) => {
        var blob = this.b64toBlob(response.data.base64, "application/pdf");
        let a = document.createElement("a");
        document.body.appendChild(a);
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        // a.target = "_blank";
        a.download = "reporte_de_ventas.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

  public b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
  
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
  
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
  
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
  
        var byteArray = new Uint8Array(byteNumbers);
  
        byteArrays.push(byteArray);
    }
  
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

 
  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
       {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id',ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id'},
      {thead: 'Fecha', value: 'salesDate',ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por fecha'},
      {thead: 'Cliente', value: 'client', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por cliente'},
      {thead: 'Método de pago', value: 'paymentMethod', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por método de pago'},
      {thead: 'Monto', value: 'totalPrice', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Buscar por monto'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
        var getFilter = '';

        if (event.filters && event.filters.name) {
            if (!!event.filters.name[0].value) {
                getFilter = event.filters.name[0].value;
            }
        }
        console.log("se ejecuta el onpagechange");
        let params = { page: event.page, size: event.rows, filter: getFilter };

        this.getSalesUserDocumentPageableData(params);
  }
}
