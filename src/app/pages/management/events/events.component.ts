import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { IEventProduct, IStoreEvent } from 'src/app/model/event/event';
import { IRekidsGarment } from 'src/app/model/product/product';
import { StoreEventService } from 'src/app/services/event/store-event.service';
import { ProductService } from 'src/app/services/product/product.service';
import { REKIDS_MOCK_GARMENTS } from '../../comercial-management/sales-panel/config';
import {
  ADMIN_EVENTS_CONFIG,
  EXTERNAL_FEIGN_SYNC_GARMENTS,
  INITIAL_ADMIN_EVENTS
} from './config';

@Component({
  selector: 'app-rekids-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EventsComponent implements OnInit {
  config = ADMIN_EVENTS_CONFIG;

  events: IStoreEvent[] = [];
  selectedEvent: IStoreEvent | null = null;
  allGarments: IRekidsGarment[] = [];

  selectedRegionFilter: string = '';
  isSyncing: boolean = false;
  lastSyncSummary: string = '';
  currentAdminLabel: string = '';

  // ABM de Eventos (Crear / Editar Evento como NAVIDAD y seleccionar 1 o varios productos)
  displayEventDialog: boolean = false;
  isEditMode: boolean = false;
  eventForm: {
    id: string;
    name: string;
    description: string;
    selectedGarments: IRekidsGarment[];
  } = {
    id: '',
    name: '',
    description: '',
    selectedGarments: []
  };

  // Modal de Descuentos (Aplicado por Admin: Monto Fijo o Porcentual)
  displayDiscountDialog: boolean = false;
  discountForm: {
    selectedGarments: IRekidsGarment[];
    discountType: 'MONTO_FIJO' | 'PORCENTUAL';
    discountValue: number;
  } = {
    selectedGarments: [],
    discountType: 'PORCENTUAL',
    discountValue: 15
  };

  constructor(
    private storeEventService: StoreEventService,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Portal Admin Rekids' },
      { label: 'Eventos, Descuentos y Sincronización' }
    ]);
  }

  ngOnInit(): void {
    const email = localStorage.getItem('email') || this.config.defaultAdminEmail;
    this.currentAdminLabel = `ADMIN (${email})`;
    this.loadSynchronizedGarments();
    this.loadEvents();
  }

  /**
   * Carga las prendas sincronizadas (desde API o estado sincronizado en localStorage / config.ts)
   */
  loadSynchronizedGarments() {
    const stored = localStorage.getItem('rekids_garments_state');
    if (stored) {
      try {
        this.allGarments = JSON.parse(stored);
      } catch (e) {
        this.allGarments = [...REKIDS_MOCK_GARMENTS];
      }
    } else {
      this.allGarments = [...REKIDS_MOCK_GARMENTS];
    }

    // Intentar traer desde backend para ambas regiones
    this.productService.getProductsByRegion('SANTA_CRUZ', { page: 0, size: 100 }).subscribe({
      next: (sczRes) => {
        const sczList = sczRes?.data?.content || sczRes?.data || [];
        this.productService.getProductsByRegion('LA_PAZ', { page: 0, size: 100 }).subscribe({
          next: (lpzRes) => {
            const lpzList = lpzRes?.data?.content || lpzRes?.data || [];
            const combined = [...sczList, ...lpzList];
            if (combined.length > 0) {
              this.allGarments = combined;
              localStorage.setItem('rekids_garments_state', JSON.stringify(this.allGarments));
            }
          }
        });
      }
    });
  }

  /**
   * Carga todos los eventos (Novedades, Descuentos y personalizados como Navidad)
   */
  loadEvents() {
    this.storeEventService.getAllEvents(this.selectedRegionFilter).subscribe({
      next: (res) => {
        const apiEvents: IStoreEvent[] = res?.data || [];
        if (apiEvents.length > 0) {
          this.events = apiEvents;
          localStorage.setItem('rekids_events_state', JSON.stringify(this.events));
        } else {
          this.loadFallbackEvents();
        }
        this.selectDefaultTabEvent();
      },
      error: () => {
        this.loadFallbackEvents();
        this.selectDefaultTabEvent();
      }
    });
  }

  private loadFallbackEvents() {
    const stored = localStorage.getItem('rekids_events_state');
    if (stored) {
      try {
        this.events = JSON.parse(stored);
      } catch (e) {
        this.events = JSON.parse(JSON.stringify(INITIAL_ADMIN_EVENTS));
      }
    } else {
      this.events = JSON.parse(JSON.stringify(INITIAL_ADMIN_EVENTS));
    }
    this.ensurePermanentEventsPresent();
  }

  private ensurePermanentEventsPresent() {
    const hasNovedades = this.events.some(e => e.code.toUpperCase() === 'NOVEDADES');
    const hasDescuentos = this.events.some(e => e.code.toUpperCase() === 'DESCUENTOS');
    if (!hasNovedades) {
      this.events.unshift(JSON.parse(JSON.stringify(INITIAL_ADMIN_EVENTS[0])));
    }
    if (!hasDescuentos) {
      this.events.splice(1, 0, JSON.parse(JSON.stringify(INITIAL_ADMIN_EVENTS[1])));
    }
  }

  private selectDefaultTabEvent() {
    if (!this.selectedEvent && this.events.length > 0) {
      this.selectedEvent = this.events[0];
    } else if (this.selectedEvent) {
      const updated = this.events.find(e => e.id === this.selectedEvent.id || e.code === this.selectedEvent.code);
      this.selectedEvent = updated || this.events[0];
    }
  }

  selectEvent(ev: IStoreEvent) {
    this.selectedEvent = ev;
  }

  getFilteredEventProducts(ev: IStoreEvent): IEventProduct[] {
    if (!ev || !ev.products) return [];
    if (!this.selectedRegionFilter) return ev.products;
    return ev.products.filter(p => p.region === this.selectedRegionFilter);
  }

  /**
   * BOTÓN SINCRONIZAR (Admin):
   * Replica las prendas y su stock desde el otro portal externo (FeignClient) hacia nuestro sistema
   * y registra las nuevas en el evento Novedades.
   */
  synchronizeGarmentsFromExternalPortal() {
    this.isSyncing = true;
    this.productService.syncGarmentsFromExternalPortal(this.selectedRegionFilter).subscribe({
      next: (res) => {
        this.isSyncing = false;
        const syncData = res?.data;
        if (syncData?.garments?.length > 0) {
          this.allGarments = syncData.garments;
          localStorage.setItem('rekids_garments_state', JSON.stringify(this.allGarments));
        }
        this.lastSyncSummary = `Sincronización exitosa por ${syncData?.syncedByAdmin || this.currentAdminLabel}: ${syncData?.totalFetched || this.allGarments.length} prendas replicadas (${syncData?.createdCount || 0} nuevas en Novedades).`;
        this.messageService.add({
          severity: 'success',
          summary: 'Sincronización Completada (FeignClient)',
          detail: this.lastSyncSummary
        });
        this.loadEvents();
      },
      error: () => {
        // Fallback local desde EXTERNAL_FEIGN_SYNC_GARMENTS (config.ts) cuando el backend/DB no está corriendo
        this.isSyncing = false;
        this.allGarments = JSON.parse(JSON.stringify(EXTERNAL_FEIGN_SYNC_GARMENTS));
        localStorage.setItem('rekids_garments_state', JSON.stringify(this.allGarments));

        const novedadesEv = this.events.find(e => e.code.toUpperCase() === 'NOVEDADES');
        if (novedadesEv) {
          novedadesEv.products = this.allGarments.filter(g => g.isNew).map(g => ({
            productId: g.id,
            sku: g.sku,
            productName: g.name,
            category: g.category,
            size: g.size,
            color: g.color,
            gender: g.gender,
            brand: g.brand,
            region: g.region,
            originalPrice: g.salePrice,
            discountType: g.discountType || 'NONE',
            discountValue: g.discountValue || 0,
            finalPrice: g.finalPrice || g.salePrice,
            approvedByAdminName: this.currentAdminLabel,
            approvedDate: Date.now()
          }));
        }
        localStorage.setItem('rekids_events_state', JSON.stringify(this.events));

        this.lastSyncSummary = `Sincronización completada por ${this.currentAdminLabel}: ${this.allGarments.length} prendas y su stock fueron replicados desde el portal externo y añadidos a Novedades.`;
        this.messageService.add({
          severity: 'success',
          summary: 'Prendas Sincronizadas (FeignClient)',
          detail: this.lastSyncSummary
        });
      }
    });
  }

  /**
   * ABM DE EVENTOS: Abrir modal para crear un nuevo evento (ej. NAVIDAD) y seleccionar 1 o varias prendas
   */
  openCreateEventDialog() {
    this.isEditMode = false;
    this.eventForm = {
      id: '',
      name: '',
      description: '',
      selectedGarments: []
    };
    this.displayEventDialog = true;
  }

  /**
   * ABM DE EVENTOS: Abrir modal para editar un evento y seleccionar/modificar las prendas asociadas
   */
  openEditEventDialog(ev: IStoreEvent) {
    this.isEditMode = true;
    const currentProductIds = new Set((ev.products || []).map(p => p.productId));
    const currentProductSkus = new Set((ev.products || []).map(p => p.sku));

    this.eventForm = {
      id: ev.id,
      name: ev.name,
      description: ev.description,
      selectedGarments: this.allGarments.filter(
        g => currentProductIds.has(g.id) || currentProductSkus.has(g.sku)
      )
    };
    this.displayEventDialog = true;
  }

  saveEvent() {
    if (!this.eventForm.name || !this.eventForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nombre Requerido',
        detail: 'Ingresa el nombre del evento (ej. NAVIDAD).'
      });
      return;
    }
    if (!this.eventForm.selectedGarments || this.eventForm.selectedGarments.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona Prendas',
        detail: 'Selecciona 1 o varias prendas que se encontrarán en este evento.'
      });
      return;
    }

    const productIds = this.eventForm.selectedGarments.map(g => g.id);

    if (this.isEditMode) {
      this.storeEventService.updateEvent(this.eventForm.id, {
        id: this.eventForm.id,
        name: this.eventForm.name.trim(),
        description: this.eventForm.description,
        productIds: productIds
      }).subscribe({
        next: () => {
          this.displayEventDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Evento Actualizado', detail: `Evento "${this.eventForm.name}" actualizado.` });
          this.loadEvents();
        },
        error: () => {
          this.saveEventLocally();
        }
      });
    } else {
      this.storeEventService.createEvent({
        name: this.eventForm.name.trim(),
        description: this.eventForm.description,
        productIds: productIds
      }).subscribe({
        next: () => {
          this.displayEventDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Evento Creado', detail: `Evento "${this.eventForm.name}" creado con ${productIds.length} prenda(s).` });
          this.loadEvents();
        },
        error: () => {
          this.saveEventLocally();
        }
      });
    }
  }

  private saveEventLocally() {
    const code = this.eventForm.name.trim().toUpperCase().replace(/\s+/g, '_');
    const mappedProducts: IEventProduct[] = this.eventForm.selectedGarments.map(g => ({
      productId: g.id,
      sku: g.sku,
      productName: g.name,
      category: g.category,
      size: g.size,
      color: g.color,
      gender: g.gender,
      brand: g.brand,
      region: g.region,
      photo: g.photo,
      originalPrice: g.salePrice,
      discountType: g.discountType || 'NONE',
      discountValue: g.discountValue || 0,
      finalPrice: g.finalPrice || g.salePrice,
      approvedByAdminName: this.currentAdminLabel,
      approvedDate: Date.now()
    }));

    if (this.isEditMode) {
      const idx = this.events.findIndex(e => e.id === this.eventForm.id);
      if (idx !== -1) {
        if (!this.events[idx].isDefault) {
          this.events[idx].name = this.eventForm.name.trim();
          this.events[idx].code = code;
        }
        this.events[idx].description = this.eventForm.description;
        this.events[idx].products = mappedProducts;
        this.events[idx].approvedByAdminName = this.currentAdminLabel;
        this.events[idx].approvedDate = Date.now();
        this.selectedEvent = this.events[idx];
      }
    } else {
      const newEv: IStoreEvent = {
        id: 'evt-' + Date.now(),
        name: this.eventForm.name.trim(),
        code: code,
        description: this.eventForm.description || `Evento especial ${this.eventForm.name}`,
        isDefault: false,
        discountType: 'NONE',
        discountValue: 0,
        approvedByAdminName: this.currentAdminLabel,
        approvedDate: Date.now(),
        state: 'ACTIVE',
        products: mappedProducts
      };
      this.events.push(newEv);
      this.selectedEvent = newEv;
    }

    // Actualizar etiquetas eventNames en las prendas
    this.syncGarmentEventTags();
    localStorage.setItem('rekids_events_state', JSON.stringify(this.events));
    this.displayEventDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: this.isEditMode ? 'Evento Actualizado' : 'Evento Creado',
      detail: `Evento "${this.eventForm.name}" guardado con ${mappedProducts.length} prenda(s).`
    });
  }

  deleteCustomEvent(ev: IStoreEvent) {
    if (ev.isDefault || ev.code === 'NOVEDADES' || ev.code === 'DESCUENTOS') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Evento Permanente',
        detail: 'Los eventos Novedades y Descuentos siempre deben existir en el sistema.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el evento "${ev.name}"?`,
      header: 'Eliminar Evento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.storeEventService.deleteEvent(ev.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `Evento "${ev.name}" eliminado.` });
            this.selectedEvent = null;
            this.loadEvents();
          },
          error: () => {
            this.events = this.events.filter(e => e.id !== ev.id);
            this.syncGarmentEventTags();
            localStorage.setItem('rekids_events_state', JSON.stringify(this.events));
            this.selectedEvent = this.events[0] || null;
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `Evento "${ev.name}" eliminado.` });
          }
        });
      }
    });
  }

  /**
   * DESCUENTOS (Admin):
   * Abrir modal para aplicar descuento por Monto Fijo (MONTO_FIJO) o Porcentual (PORCENTUAL)
   * registrando qué Admin aceptó/aplicó el descuento.
   */
  openApplyDiscountDialog() {
    this.discountForm = {
      selectedGarments: [],
      discountType: 'PORCENTUAL',
      discountValue: 15
    };
    this.displayDiscountDialog = true;
  }

  calculatePreviewFinalPrice(garment: IRekidsGarment): number {
    const base = Number(garment.salePrice || 0);
    const val = Number(this.discountForm.discountValue || 0);
    if (val <= 0) return base;
    if (this.discountForm.discountType === 'MONTO_FIJO') {
      return Math.max(0, Number((base - val).toFixed(2)));
    } else {
      return Math.max(0, Number((base - (base * val) / 100).toFixed(2)));
    }
  }

  submitAdminDiscount() {
    if (!this.discountForm.selectedGarments || this.discountForm.selectedGarments.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona Prendas',
        detail: 'Selecciona 1 o varias prendas para aplicar el descuento.'
      });
      return;
    }
    if (!this.discountForm.discountValue || this.discountForm.discountValue <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Valor Inválido',
        detail: 'El monto o porcentaje de descuento debe ser mayor a 0.'
      });
      return;
    }
    if (this.discountForm.discountType === 'PORCENTUAL' && this.discountForm.discountValue >= 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Porcentaje Inválido',
        detail: 'El descuento porcentual debe ser menor a 100%.'
      });
      return;
    }

    const productIds = this.discountForm.selectedGarments.map(g => g.id);

    this.storeEventService.applyDiscount({
      productIds: productIds,
      discountType: this.discountForm.discountType,
      discountValue: this.discountForm.discountValue
    }).subscribe({
      next: () => {
        this.applyDiscountLocally();
      },
      error: () => {
        this.applyDiscountLocally();
      }
    });
  }

  private applyDiscountLocally() {
    const now = Date.now();
    const descuentosEv = this.events.find(e => e.code.toUpperCase() === 'DESCUENTOS');

    for (const selected of this.discountForm.selectedGarments) {
      const finalPrice = this.calculatePreviewFinalPrice(selected);

      // Actualizar en allGarments
      const garmentIdx = this.allGarments.findIndex(g => g.id === selected.id || g.sku === selected.sku);
      if (garmentIdx !== -1) {
        this.allGarments[garmentIdx].discountType = this.discountForm.discountType;
        this.allGarments[garmentIdx].discountValue = this.discountForm.discountValue;
        this.allGarments[garmentIdx].finalPrice = finalPrice;
        this.allGarments[garmentIdx].unitaryCost = finalPrice;
        this.allGarments[garmentIdx].discountApprovedBy = this.currentAdminLabel;
        this.allGarments[garmentIdx].discountApprovedDate = now;
      }

      if (descuentosEv) {
        const existingIdx = descuentosEv.products.findIndex(p => p.productId === selected.id || p.sku === selected.sku);
        const epRecord: IEventProduct = {
          productId: selected.id,
          sku: selected.sku,
          productName: selected.name,
          category: selected.category,
          size: selected.size,
          color: selected.color,
          gender: selected.gender,
          brand: selected.brand,
          region: selected.region,
          photo: selected.photo,
          originalPrice: selected.salePrice,
          discountType: this.discountForm.discountType,
          discountValue: this.discountForm.discountValue,
          finalPrice: finalPrice,
          approvedByAdminName: this.currentAdminLabel,
          approvedDate: now
        };
        if (existingIdx !== -1) {
          descuentosEv.products[existingIdx] = epRecord;
        } else {
          descuentosEv.products.push(epRecord);
        }
        descuentosEv.approvedByAdminName = this.currentAdminLabel;
        descuentosEv.approvedDate = now;
      }
    }

    this.syncGarmentEventTags();
    localStorage.setItem('rekids_garments_state', JSON.stringify(this.allGarments));
    localStorage.setItem('rekids_events_state', JSON.stringify(this.events));

    if (descuentosEv) {
      this.selectedEvent = descuentosEv;
    }

    this.displayDiscountDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Descuento Aprobado por Admin',
      detail: `Descuento (${this.discountForm.discountType === 'PORCENTUAL' ? this.discountForm.discountValue + '%' : this.discountForm.discountValue + ' BOB'}) aplicado por ${this.currentAdminLabel}.`
    });
  }

  removeProductFromCurrentEvent(ep: IEventProduct) {
    if (!this.selectedEvent) return;
    const ev = this.selectedEvent;

    this.storeEventService.removeProductFromEvent(ev.id, ep.productId).subscribe({
      next: () => {
        this.removeProductLocally(ev, ep);
      },
      error: () => {
        this.removeProductLocally(ev, ep);
      }
    });
  }

  private removeProductLocally(ev: IStoreEvent, ep: IEventProduct) {
    ev.products = (ev.products || []).filter(p => p.productId !== ep.productId && p.sku !== ep.sku);
    if (ev.code.toUpperCase() === 'DESCUENTOS') {
      const idx = this.allGarments.findIndex(g => g.id === ep.productId || g.sku === ep.sku);
      if (idx !== -1) {
        this.allGarments[idx].discountType = 'NONE';
        this.allGarments[idx].discountValue = 0;
        this.allGarments[idx].finalPrice = this.allGarments[idx].salePrice;
        this.allGarments[idx].unitaryCost = this.allGarments[idx].salePrice;
        this.allGarments[idx].discountApprovedBy = null;
      }
    }
    this.syncGarmentEventTags();
    localStorage.setItem('rekids_garments_state', JSON.stringify(this.allGarments));
    localStorage.setItem('rekids_events_state', JSON.stringify(this.events));
    this.messageService.add({
      severity: 'info',
      summary: 'Prenda Removida',
      detail: `La prenda [${ep.sku}] fue removida del evento ${ev.name}.`
    });
  }

  private syncGarmentEventTags() {
    for (const g of this.allGarments) {
      const tags: string[] = [];
      for (const ev of this.events) {
        if ((ev.products || []).some(p => p.productId === g.id || p.sku === g.sku)) {
          tags.push(ev.name);
        }
      }
      g.eventNames = tags;
    }
  }
}
