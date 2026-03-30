import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TransferTicketService } from '../../../../services/transfer-ticket/transfer-ticket.service';
import { SupplierService } from '../../../../services/supplier/supplier.service';
import { BranchOfficeService } from '../../../../services/branchOffice/branchOffice.service';
import { ProductService } from '../../../../services/product/product.service';
import { WarehouseService } from '../../../../services/warehouse/warehouse.service';
import { TransferType } from '../../../../model/transfer-ticket/transfer-ticket';

@Component({
  selector: 'app-create-transfer-ticket',
  templateUrl: './create-transfer-ticket.component.html',
  styleUrls: [],
  providers: [MessageService]
})
export class CreateTransferTicketComponent implements OnInit {

  newTicketData: any = {
    transferType: 'INTERNAL_TRANSFER',
    sourceId: '',
    destinationId: '',
    comments: '',
    details: []
  };

  transferTypes = [
    { label: 'Traspaso Interno (Desde Otro Almacén)', value: TransferType.INTERNAL_TRANSFER },
    { label: 'Abastecimiento Externo (De Proveedor)', value: TransferType.EXTERNAL_SUPPLY }
  ];

  availableSuppliers: any[] = [];
  availableBranches: any[] = [];
  availableProducts: any[] = [];

  constructor(
    private router: Router,
    private ticketService: TransferTicketService,
    private messageService: MessageService,
    private supplierService: SupplierService,
    private branchOfficeService: BranchOfficeService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.addProductLine();
  }

  loadInitialData() {
    this.supplierService.getSuppliers().subscribe(res => {
      this.availableSuppliers = res.data || [];
    });
    this.branchOfficeService.getBranchOfficePageable({ page: 0, size: 100 }).subscribe(res => {
      this.availableBranches = res.data.content || [];
    });
  }

  onSourceOrTypeChange() {
    this.availableProducts = [];
    this.newTicketData.details.forEach(d => d.productId = '');

    if (this.newTicketData.transferType === 'EXTERNAL_SUPPLY') {
      this.productService.getProductPageable({ page: 0, size: 100 }).subscribe(res => {
        this.availableProducts = res.data?.content || [];
      });
    } else if (this.newTicketData.transferType === 'INTERNAL_TRANSFER' && this.newTicketData.sourceId) {
      this.warehouseService.getWarehousePageable({ idBranchOffice: this.newTicketData.sourceId, page: 0, size: 500 }).subscribe(res => {
        this.availableProducts = (res.data?.content || []).map(w => ({
          id: w.idProduct, // Aquí mappeo el Producto Real
          name: w.productName,
          label: `${w.productName} (Stock: ${w.stock})`,
          maxStock: w.stock
        }));
      });
    }
  }

  addProductLine() {
    this.newTicketData.details.push({ productId: '', quantityShipped: 1 });
  }

  getMaxStock(productId: string): number {
    if (this.newTicketData.transferType !== 'INTERNAL_TRANSFER' || !productId) return 999999;
    const p = this.availableProducts.find(x => x.id === productId);
    return p ? p.maxStock : 999999;
  }

  removeProductLine(index: number) {
    this.newTicketData.details.splice(index, 1);
  }

  saveNewTicket() {
    if(!this.newTicketData.destinationId || this.newTicketData.details.length === 0) {
      this.messageService.add({severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar un destino y agregar al menos un producto.'});
      return;
    }
    
    if(this.newTicketData.transferType === 'EXTERNAL_SUPPLY' && !this.newTicketData.sourceId) {
       this.messageService.add({severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar al Proveedor emisor.'});
       return;
    }

    if(this.newTicketData.transferType === 'INTERNAL_TRANSFER' && !this.newTicketData.sourceId) {
       this.messageService.add({severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar el Almacén de origen.'});
       return;
    }

    // Validar stock máximo para transferencias internas
    if(this.newTicketData.transferType === 'INTERNAL_TRANSFER') {
      for (let i = 0; i < this.newTicketData.details.length; i++) {
        const det = this.newTicketData.details[i];
        if(!det.productId) {
           this.messageService.add({severity: 'warn', summary: 'Atención', detail: `Debe seleccionar un producto en la Fila ${i+1}.`});
           return;
        }
        const productData = this.availableProducts.find(p => p.id === det.productId);
        if(productData && det.quantityShipped > productData.maxStock) {
           this.messageService.add({severity: 'error', summary: 'Stock Insuficiente', detail: `La cantidad solicitada en la fila ${i+1} supera el stock actual de ${productData.maxStock}`});
           return;
        }
      }
    }

    const payload = {
      transferType: this.newTicketData.transferType,
      sourceId: this.newTicketData.sourceId,
      destinationId: this.newTicketData.destinationId,
      comments: this.newTicketData.comments,
      details: this.newTicketData.details
    };

    this.ticketService.createTransferTicket(payload).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Ticket Creado', detail: 'La solicitud se generó correctamente.'});
        setTimeout(() => {
          this.router.navigate(['/dashboard/management/transfer-ticket']);
        }, 1500);
      },
      error: () => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al procesar la solicitud.'})
    });
  }

  cancelCreation() {
    this.router.navigate(['/dashboard/management/transfer-ticket']);
  }
}
