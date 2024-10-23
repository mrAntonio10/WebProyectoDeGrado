import { Component, OnInit } from '@angular/core';
import { dC } from '@fullcalendar/core/internal-common';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { CustomerService } from 'src/app/demo/service/customerservice';
import { ISalesDocumentInfo } from 'src/app/model/document/document';
import { DocumentService } from 'src/app/services/document/document.service';

@Component({
  selector: 'app-sales-document-info',
  templateUrl: './sales-document-info.component.html',
  providers: [MessageService],
  styleUrls: ['./sales-document-info.component.scss']
})
export class SalesDocumentInfoComponent implements OnInit {
  customers3;
  idDocument: string;

  salesDocumentInfo: ISalesDocumentInfo;

  constructor(private customerService: CustomerService,
    private documentService: DocumentService,
    private ref: DynamicDialogRef,
    private dConfig: DynamicDialogConfig,
    private messageService: MessageService,
  ){}

  ngOnInit(): void {
    this.getSalesDocumentInfo(this.dConfig.data.idDocument);
  }

  private getSalesDocumentInfo(idDocument: string) {
    let salesDocumentInfoObservable = this.documentService.getDocumentById(idDocument);

    forkJoin([salesDocumentInfoObservable]).subscribe({
      next: ([info]) => {
        this.salesDocumentInfo = info.data;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    })
  }

}
