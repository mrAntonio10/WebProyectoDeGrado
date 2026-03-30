import { Component, OnInit } from '@angular/core';
import { TransferTicketService } from '../../../services/transfer-ticket/transfer-ticket.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ITransferTicket, TicketStatus, TransferType } from '../../../model/transfer-ticket/transfer-ticket';
import { SupplierService } from '../../../services/supplier/supplier.service';
import { BranchOfficeService } from '../../../services/branchOffice/branchOffice.service';
import { ProductService } from '../../../services/product/product.service';
import { WarehouseService } from '../../../services/warehouse/warehouse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transfer-ticket',
  templateUrl: './transfer-ticket.component.html',
  styleUrls: ['./transfer-ticket.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TransferTicketComponent implements OnInit {

  tickets: ITransferTicket[] = [];
  loading: boolean = true;
  
  displayTimeline: boolean = false;
  selectedTicket: ITransferTicket | null = null;
  events: any[] = [];
  
  displayDetails: boolean = false;
  
  branchMap: { [key: string]: string } = {};
  supplierMap: { [key: string]: string } = {};
  // Para las acciones de Aceptar/Rechazar
  displayActionDialog: boolean = false;
  actionType: 'ACCEPT' | 'REJECT' | 'DAMAGE' = 'ACCEPT';
  actionComment: string = '';
  // Filas editables de productos en el dialog de acción
  detailRows: { productId: string; productName: string; shipped: number; quantityReceived: number; quantityDamaged: number }[] = [];

  constructor(
    private ticketService: TransferTicketService,
    private messageService: MessageService,
    private branchOfficeService: BranchOfficeService,
    private supplierService: SupplierService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDictionaries();
    this.loadTickets();
  }

  loadDictionaries() {
    this.branchOfficeService.getBranchOfficePageable({ page: 0, size: 500 }).subscribe(res => {
      (res.data?.content || []).forEach((b: any) => this.branchMap[b.id] = b.name);
    });
    this.supplierService.getSuppliers().subscribe(res => {
      (res.data || []).forEach((s: any) => this.supplierMap[s.id] = s.name);
    });
  }

  getSourceName(ticket: ITransferTicket): string {
    if (ticket.transferType === 'INTERNAL_TRANSFER') {
      return this.branchMap[ticket.sourceId] || ticket.sourceId;
    } else {
      return this.supplierMap[ticket.sourceId] || ticket.sourceId;
    }
  }

  loadTickets() {
    this.loading = true;
    this.ticketService.getTransferTickets().subscribe({
      next: (res) => {
        if(res.success || res.statusCode === 200 || res.status === 200) {
           this.tickets = res.data || [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets.' });
        this.loading = false;
      }
    });
  }

  viewTimeline(ticket: ITransferTicket) {
    this.selectedTicket = ticket;
    // Mapeamos los eventos para la UI del Timeline
    const sortedEvents = [...(ticket.events || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.events = sortedEvents.map(ev => ({
      status: ev.statusChange,
      date: ev.date,
      icon: this.getIconForStatus(ev.statusChange),
      color: this.getColorForStatus(ev.statusChange),
      user: ev.userName || ev.userId || ((ev as any).user ? (ev as any).user.email : 'Sistema'),
      comment: ev.comments
    }));
    this.displayTimeline = true;
  }

  viewDetails(ticket: ITransferTicket) {
    this.selectedTicket = ticket;
    this.displayDetails = true;
  }

  /** Cuando el usuario cambia la cantidad dañada, recalcula automáticamente los recibidos OK */
  onDamagedChange(index: number) {
    const row = this.detailRows[index];
    const damaged = row.quantityDamaged || 0;
    const received = row.shipped - damaged;
    this.detailRows[index].quantityReceived = received >= 0 ? received : 0;
  }

  getIconForStatus(status: string) {
    switch(status) {
      case 'PENDING': return 'pi pi-clock';
      case 'ACCEPTED': return 'pi pi-check';
      case 'REJECTED': return 'pi pi-times';
      case 'PARTIALLY_DAMAGED': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-info-circle';
    }
  }

  getColorForStatus(status: string) {
    switch(status) {
      case 'PENDING': return '#F59E0B';
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'PARTIALLY_DAMAGED': return '#F97316';
      default: return '#3B82F6';
    }
  }

  openActionDialog(ticket: ITransferTicket, action: 'ACCEPT' | 'REJECT' | 'DAMAGE') {
    this.selectedTicket = ticket;
    this.actionType = action;
    this.actionComment = '';
    // Inicializar filas con los productos del ticket (pre-rellenados con total enviado)
    this.detailRows = (ticket.details || []).map((d: any) => ({
      productId: d.product?.id || d.productId,
      productName: d.product?.name || d.productId,
      shipped: Number(d.quantityShipped),
      quantityReceived: Number(d.quantityShipped), // por defecto: todo llegó
      quantityDamaged: 0
    }));
    this.displayActionDialog = true;
  }

  // --- MÉTODOS DE CREACIÓN DE TICKET ---
  openCreateTicket() {
    this.router.navigate(['/dashboard/management/transfer-ticket/create']);
  }

  // --- MÉTODOS DE HISTÓRICO Y ACCIONES ---
  submitAction() {
    if (!this.selectedTicket) return;
    
    if (this.actionType === 'REJECT' && !this.actionComment) {
       this.messageService.add({severity: 'warn', summary: 'Atención', detail: 'Debes ingresar un comentario para rechazar.'});
       return;
    }

    // Validar coherencia en filas si no es rechazo puro
    if (this.actionType !== 'REJECT') {
      for (const row of this.detailRows) {
        if ((row.quantityReceived + row.quantityDamaged) > row.shipped) {
          this.messageService.add({ severity: 'error', summary: 'Error de Cantidades',
            detail: `"${row.productName}": Recibidos + Dañados supera lo enviado (${row.shipped}).` });
          return;
        }
      }
    }

    let nextStatus = TicketStatus.ACCEPTED;
    if (this.actionType === 'REJECT') nextStatus = TicketStatus.REJECTED;
    if (this.actionType === 'DAMAGE') nextStatus = TicketStatus.PARTIALLY_DAMAGED;

    const payload = {
      newStatus: nextStatus,
      comments: this.actionComment,
      details: this.actionType !== 'REJECT'
        ? this.detailRows.map(r => ({
            productId: r.productId,
            quantityReceived: r.quantityReceived,
            quantityDamaged: r.quantityDamaged
          }))
        : []
    };

    this.ticketService.updateTicketStatus(this.selectedTicket.id, payload).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'El estado del ticket ha sido actualizado correctamente.' });
        this.displayActionDialog = false;
        this.loadTickets();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Ocurrió un error al actualizar el estado.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}
