import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { ReportService } from 'src/app/services/report/report.service';

@Component({
  selector: 'app-admin-sales-report',
  templateUrl: './admin-sales-report.component.html',
  providers: [MessageService, DatePipe],
  styleUrls: ['./admin-sales-report.component.scss']
})
export class AdminSalesReportComponent implements OnInit, OnDestroy {

  startDate: Date = new Date();
  endDate: Date = new Date();

  // Combobox Data
  branchOffices: any[] = [];
  selectedBranchOffice = '';

  selectedState = 'ACEPTADO';
  states = [
    { name: 'Aceptado', code: 'ACEPTADO' },
    { name: 'Eliminado', code: 'DELETED' }
  ];

  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private primengConfig: PrimeNGConfig,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private reportService: ReportService,
    private branchOfficeService: BranchOfficeService,
  ) { }

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

    this.formGroup = this.buildForm();
    this.getAllBranchOffices();
  }

  ngOnDestroy(): void { }

  buildForm(): FormGroup {
    const group = this.fb.group({});
    group.addControl('idBranchOffice', this.fb.control('', [Validators.required]));
    group.addControl('startDate', this.fb.control(this.startDate, [Validators.required]));
    group.addControl('endDate', this.fb.control(this.endDate, [Validators.required]));
    group.addControl('state', this.fb.control('ACEPTADO'));
    return group;
  }

  getAllBranchOffices() {
    this.branchOfficeService.getBranchOfficePageable({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.branchOffices = response.data.content || response.data;
        if (this.branchOffices.length > 0) {
          this.selectedBranchOffice = this.branchOffices[0].id;
          this.formGroup.get('idBranchOffice').setValue(this.selectedBranchOffice);
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las sucursales' });
      }
    });
  }

  submitForm() {
    this.generateAdminSalesPDFReport();
  }

  generateAdminSalesPDFReport() {
    if (!this.formGroup.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete los campos requeridos.' });
      return;
    }

    let sd = this.datePipe.transform(this.formGroup.value.startDate, 'dd/MM/yyyy');
    let ed = this.datePipe.transform(this.formGroup.value.endDate, 'dd/MM/yyyy');
    let idBranch = this.formGroup.value.idBranchOffice;
    let s = this.formGroup.value.state;

    let params = { idBranchOffice: idBranch, startDate: sd, endDate: ed, state: s };

    let observablePdfReport = this.reportService.getAdminSalesPDFReport(params);
    forkJoin([observablePdfReport]).subscribe({
      next: ([response]) => {
        var blob = this.b64toBlob(response.data.base64, "application/pdf");
        let a = document.createElement("a");
        document.body.appendChild(a);
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = response.data.filename || "reporte_de_ventas_admin.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        let msg = err?.error?.data?.response || 'Ocurrió un error al generar el reporte';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  public b64toBlob(b64Data: string, contentType: string) {
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

    return new Blob(byteArrays, { type: contentType });
  }

}
