import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { ICreateDocument } from 'src/app/model/document/document';
import { IStoreEvent } from 'src/app/model/event/event';
import { IRekidsGarment } from 'src/app/model/product/product';
import { IDetailWarehouseProducts, ISalesPanelPageableContent } from 'src/app/model/warehouse/warehouse';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { DocumentService } from 'src/app/services/document/document.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { StoreEventService } from 'src/app/services/event/store-event.service';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { ProductService } from 'src/app/services/product/product.service';
import {
  IRegionOption,
  REKIDS_MOCK_EVENTS,
  REKIDS_MOCK_GARMENTS,
  REKIDS_SALES_CONFIG,
  SALES_PANEL_TABLE_STRUCTURE
} from './config';

@Component({
  selector: 'app-sales-panel',
  templateUrl: './sales-panel.component.html',
  providers: [MessageService],
  styleUrls: ['./sales-panel.component.scss']
})
export class SalesPanelComponent implements OnInit, OnDestroy {
  pageableData: ISalesPanelPageableContent;
  tableStructure: ColumnStructure[];
  gobalFilters: string[];

  createFormStructure: FormConfig;
  isVisibleCreate = false;
  actions: any = [];
  submittedData: any;

  formGroup: FormGroup;
  formData: any;

  productName: string = '';
  clientName: string = '';
  clientPhone: string = '';
  totalPrice: number = 0;
  totalSavings: number = 0;

  // Rekids Storefront E-commerce state
  config = REKIDS_SALES_CONFIG;
  regions: IRegionOption[] = REKIDS_SALES_CONFIG.regions;
  selectedRegion: string = '';
  searchText: string = '';
  channel: string = REKIDS_SALES_CONFIG.defaultChannel;
  paymentMethod: string = REKIDS_SALES_CONFIG.defaultPaymentMethod;

  regionGarments: IRekidsGarment[] = [];
  filteredGarments: IRekidsGarment[] = [];
  events: IStoreEvent[] = [];
  selectedEventCode: string = 'TODOS';
  isLoggedInAdmin: boolean = false;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private branchOfficeService: BranchOfficeService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private enterpriseService: EnterpriseService,
    private documentService: DocumentService,
    private productService: ProductService,
    private storeEventService: StoreEventService,
    private breadcrumbService: BreadcrumbService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.setItems([
      { label: 'Rekids Tienda Online' },
      { label: 'Catálogo Infantil' }
    ]);

    this.isLoggedInAdmin = !!localStorage.getItem('token');
    this.productName = sessionStorage.getItem('pName');
    this.clientName = sessionStorage.getItem('clientName') || '';
    this.clientPhone = sessionStorage.getItem('clientPhone') || '';
    this.selectedRegion = sessionStorage.getItem('selectedRegion') || '';

    this.actions = [{ icon: 'pi pi-times', class: 'p-button-danger', actionName: 'block' }];

    this.buildPageStructure();
    this.getProductsFromOrderPageableData();

    if (this.selectedRegion) {
      this.loadRegionEventsAndGarments(this.selectedRegion);
    }

    this.formData = JSON.parse(sessionStorage.getItem('formData'));
    if (this?.formData?.action === 'create') {
      this.messageCreatedSale(this.formData);
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
    sessionStorage.removeItem('pName');
  }

  selectRegion(regionCode: string) {
    if (this.selectedRegion && this.selectedRegion !== regionCode) {
      sessionStorage.removeItem('productDetail');
      this.pageableData = null;
      this.totalPrice = 0;
      this.totalSavings = 0;
    }
    this.selectedRegion = regionCode;
    sessionStorage.setItem('selectedRegion', regionCode);
    this.selectedEventCode = 'TODOS';
    this.searchText = '';
    this.loadRegionEventsAndGarments(regionCode);
    this.messageService.add({
      severity: 'info',
      summary: 'Tienda Seleccionada',
      detail: `Bienvenido a Rekids ${this.getRegionLabel(regionCode)}`
    });
  }

  getRegionLabel(regionCode: string): string {
    const found = this.regions.find(r => r.code === regionCode);
    return found ? found.name : regionCode;
  }

  loadRegionEventsAndGarments(regionCode: string) {
    this.storeEventService.getPublicEvents(regionCode).subscribe({
      next: (res) => {
        const apiEvents = res?.data || [];
        this.events = apiEvents.length > 0 ? apiEvents : this.getMockEventsFromStorageOrConfig();
      },
      error: () => {
        this.events = this.getMockEventsFromStorageOrConfig();
      }
    });

    this.productService.getProductsByRegion(regionCode, { page: 0, size: 50 }).subscribe({
      next: (res) => {
        const apiGarments = res?.data?.content || res?.data || [];
        if (apiGarments.length > 0) {
          this.regionGarments = apiGarments.map((g: any) => this.enrichGarmentImage(g));
        } else {
          this.regionGarments = this.getMockGarmentsForRegion(regionCode);
        }
        this.applyFilters();
      },
      error: () => {
        this.regionGarments = this.getMockGarmentsForRegion(regionCode);
        this.applyFilters();
      }
    });
  }

  /**
   * Asegura que cada prenda tenga su imagen URL de internet (desde API o fallback config.ts)
   */
  private enrichGarmentImage(garment: any): IRekidsGarment {
    if (!garment.photo) {
      const mockMatch = REKIDS_MOCK_GARMENTS.find(
        m => m.sku.toUpperCase() === (garment.sku || '').toUpperCase()
      );
      garment.photo = mockMatch?.photo || this.config.defaultFallbackImage;
    }
    return garment;
  }

  getGarmentImage(garment: any): string {
    if (garment?.photo) {
      return garment.photo;
    }
    const mockMatch = REKIDS_MOCK_GARMENTS.find(
      m => m.sku.toUpperCase() === (garment?.sku || '').toUpperCase()
    );
    return mockMatch?.photo || this.config.defaultFallbackImage;
  }

  onImageError(event: any) {
    event.target.src = this.config.defaultFallbackImage;
  }

  private getMockEventsFromStorageOrConfig(): IStoreEvent[] {
    const stored = localStorage.getItem('rekids_events_state');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return REKIDS_MOCK_EVENTS;
  }

  private getMockGarmentsForRegion(regionCode: string): IRekidsGarment[] {
    const stored = localStorage.getItem('rekids_garments_state');
    let allGarments: IRekidsGarment[] = REKIDS_MOCK_GARMENTS;
    if (stored) {
      try {
        allGarments = JSON.parse(stored).map((g: any) => this.enrichGarmentImage(g));
      } catch (e) {}
    }
    return allGarments.filter(g => g.region === regionCode);
  }

  applyEventFilter(eventCode: string) {
    this.selectedEventCode = eventCode;
    this.applyFilters();
  }

  applyFilters() {
    const eventCode = this.selectedEventCode;
    let list = [...this.regionGarments];

    if (eventCode && eventCode !== 'TODOS') {
      const selectedEv = this.events.find(
        e => e.code.toUpperCase() === eventCode.toUpperCase() || e.name.toUpperCase() === eventCode.toUpperCase()
      );
      const eventProductSkus = new Set((selectedEv?.products || []).map(p => (p.sku || '').toUpperCase()));

      list = list.filter(g => {
        if (eventCode.toUpperCase() === 'NOVEDADES' && g.isNew) return true;
        if (eventCode.toUpperCase() === 'DESCUENTOS' && g.discountValue && g.discountValue > 0) return true;
        if (eventProductSkus.has((g.sku || '').toUpperCase())) return true;
        return (g.eventNames || []).some(
          en => en.toUpperCase() === eventCode.toUpperCase() || (selectedEv && en.toUpperCase() === selectedEv.name.toUpperCase())
        );
      });
    }

    if (this.searchText && this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(
        g =>
          (g.name || '').toLowerCase().includes(q) ||
          (g.brand || '').toLowerCase().includes(q) ||
          (g.size || '').toLowerCase().includes(q) ||
          (g.color || '').toLowerCase().includes(q) ||
          (g.category || '').toLowerCase().includes(q)
      );
    }

    this.filteredGarments = list;
  }

  /**
   * Adiciona la prenda al carrito del comprador (internamente utiliza su código/SKU en el sistema)
   */
  addToCart(garment: IRekidsGarment) {
    if (!this.selectedRegion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona tu Ciudad',
        detail: 'Selecciona primero Santa Cruz o La Paz.'
      });
      return;
    }

    this.appendGarmentToOrderDetail(garment);
  }

  getCartQtyForGarment(garment: IRekidsGarment): number {
    const items = this.pageableData?.content || [];
    const found = items.find(
      (i: any) => i.idProduct === garment.id || (i.sku && i.sku.toUpperCase() === (garment.sku || '').toUpperCase())
    );
    return found ? Number(found.quantity) : 0;
  }

  getTotalCartItemsCount(): number {
    const items = this.pageableData?.content || [];
    return items.reduce((acc: number, item: any) => acc + Number(item.quantity || 0), 0);
  }

  updateCartItemQuantity(item: any, delta: number) {
    const newQty = Number(item.quantity) + delta;
    if (newQty <= 0) {
      this.removeCartItemDirect(item);
      return;
    }
    if (newQty > item.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock Disponible',
        detail: `Solo quedan ${item.stock} unidad(es) disponibles de "${item.productName}".`
      });
      return;
    }
    item.quantity = newQty;
    this.setTotalPriceByQuantityChange(item);
  }

  removeCartItemDirect(item: any) {
    const deleteItemIndex = this.pageableData.content.findIndex(d => d.idProduct === item.idProduct);
    if (deleteItemIndex !== -1) {
      this.pageableData.content.splice(deleteItemIndex, 1);
      sessionStorage.setItem('productDetail', JSON.stringify(this.pageableData));
      this.getProductsFromOrderPageableData();
    }
  }

  appendGarmentToOrderDetail(garment: any) {
    const rawStr = sessionStorage.getItem('productDetail');
    const detailObj = rawStr
      ? JSON.parse(rawStr)
      : { content: [], page: { totalElements: 0, size: 10, number: 0, totalPages: 1 } };

    const sku = (garment.sku || 'RK-000').toUpperCase();
    const idProduct = garment.id || sku;
    const originalPrice = Number(garment.salePrice || garment.unitaryCost || 0);
    const finalPrice = Number(garment.finalPrice || garment.unitaryCost || originalPrice);
    const unitDiscount = Math.max(0, originalPrice - finalPrice);
    const maxStock = Number(garment.stock || 1);

    const existingIndex = detailObj.content.findIndex(
      (p: any) => p.idProduct === idProduct || (p.sku && p.sku.toUpperCase() === sku)
    );

    if (existingIndex !== -1) {
      if (detailObj.content[existingIndex].quantity >= maxStock) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Stock Máximo Alcanzado',
          detail: `Solo hay ${maxStock} unidad(es) disponibles de "${garment.name}".`
        });
        return;
      }
      detailObj.content[existingIndex].quantity += 1;
      const qty = detailObj.content[existingIndex].quantity;
      detailObj.content[existingIndex].totalDiscount = Number((unitDiscount * qty).toFixed(2));
      detailObj.content[existingIndex].totalPrice = Number((finalPrice * qty).toFixed(2));
    } else {
      const displayTitle = `${garment.name}${garment.size ? ' • Talla ' + garment.size : ''}`;
      detailObj.content.push({
        idProduct: idProduct,
        sku: sku,
        productName: displayTitle,
        brand: garment.brand || 'Rekids',
        photo: this.getGarmentImage(garment),
        originalPrice: originalPrice,
        unitaryCost: finalPrice,
        quantity: 1,
        totalDiscount: Number(unitDiscount.toFixed(2)),
        totalPrice: Number(finalPrice.toFixed(2)),
        stock: maxStock
      });
    }

    detailObj.page.totalElements = detailObj.content.length;
    sessionStorage.setItem('productDetail', JSON.stringify(detailObj));

    const totalPricesCopy = detailObj.content.map((item: any) => item.quantity * item.unitaryCost);
    sessionStorage.setItem('totalPricesCopy', JSON.stringify(totalPricesCopy));

    this.messageService.add({
      severity: 'success',
      summary: '¡Añadido al Carrito!',
      detail: `${garment.name} (${finalPrice} BOB)`
    });

    this.getProductsFromOrderPageableData();
  }

  saveInlineBuyerInfo() {
    sessionStorage.setItem('clientName', (this.clientName || '').trim());
    sessionStorage.setItem('clientPhone', (this.clientPhone || '').trim());
  }

  goToAdminLogin() {
    this.router.navigate(['/home']);
  }

  goToAdminEvents() {
    this.router.navigate(['/dashboard/management/events']);
  }

  routeAddClientInfo() {
    this.saveInlineBuyerInfo();
    this.router.navigate(['/dashboard/comercial-management/sales-panel/add-client-info']);
  }

  routePaymentMethod() {
    if (!this.selectedRegion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona tu Ciudad',
        detail: 'Selecciona primero Santa Cruz o La Paz.'
      });
      return;
    }
    if (!this.pageableData?.content || this.pageableData.content.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito Vacío',
        detail: 'Adiciona al menos una prenda a tu carrito para continuar.'
      });
      return;
    }
    this.saveInlineBuyerInfo();
    sessionStorage.setItem('totalPrice', this.totalPrice.toString());
    this.router.navigate(['/dashboard/comercial-management/sales-panel/payment-method']);
  }

  deleteAllProductsFromDetail() {
    sessionStorage.removeItem('productDetail');
    this.totalPrice = 0;
    this.totalSavings = 0;

    this.messageService.add({ severity: 'info', summary: 'Carrito Vaciado', detail: 'Se vació tu carrito de compras.' });
    this.getProductsFromOrderPageableData();
  }

  private getProductsFromOrderPageableData(params: any = { page: 0, size: 5 }) {
    if (!!this.productName) {
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: `Prenda ${this.productName} añadida al carrito.` });
      sessionStorage.removeItem('pName');
      this.productName = '';
    }

    this.pageableData = JSON.parse(sessionStorage.getItem('productDetail'));
    this.totalPrice = this.getTotalPrice();
    this.totalSavings = this.getTotalSavings();
  }

  handleActionTriggered(event: { action: string; data: IDetailWarehouseProducts }) {
    switch (event.action) {
      case 'block':
        this.deleteProductFromOrder(event.data);
        break;
      case 'quantity':
        this.setTotalPriceByQuantityChange(event.data);
        break;
      case 'totalDiscount':
        this.setTotalPriceByDiscountChange(event.data);
        break;
    }
  }

  deleteProductFromOrder(data: IDetailWarehouseProducts) {
    this.confirmationService.confirm({
      message: `¿Deseas quitar "${data.productName}" de tu carrito?`,
      header: 'Quitar del Carrito',
      icon: 'pi pi-trash',
      accept: () => {
        this.removeCartItemDirect(data);
        this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: 'Prenda quitada del carrito.' });
      }
    });
  }

  setTotalPriceByQuantityChange(data: any) {
    const itemIndex = this.pageableData.content.findIndex(d => d.idProduct === data.idProduct);
    if (itemIndex !== -1) {
      const item: any = this.pageableData.content[itemIndex];
      const unitOrig = Number(item.originalPrice || item.unitaryCost);
      const unitDisc = Math.max(0, unitOrig - Number(item.unitaryCost));
      item.quantity = data.quantity;
      item.totalDiscount = Number((unitDisc * data.quantity).toFixed(2));
      item.totalPrice = Number((data.quantity * item.unitaryCost).toFixed(2));
      sessionStorage.setItem('productDetail', JSON.stringify(this.pageableData));
    }
    this.getProductsFromOrderPageableData();
  }

  setTotalPriceByDiscountChange(data: any) {
    this.getProductsFromOrderPageableData();
  }

  getTotalPrice(): number {
    let total = 0;
    const productDetailList = JSON.parse(sessionStorage.getItem('productDetail'))?.content ?? [];
    productDetailList.forEach((d: any) => {
      total += Number(d.totalPrice || 0);
    });
    return Number(total.toFixed(2));
  }

  getTotalSavings(): number {
    let savings = 0;
    const productDetailList = JSON.parse(sessionStorage.getItem('productDetail'))?.content ?? [];
    productDetailList.forEach((d: any) => {
      savings += Number(d.totalDiscount || 0);
    });
    return Number(savings.toFixed(2));
  }

  private buildPageStructure() {
    this.clientName = sessionStorage.getItem('clientName') || '';
    this.clientPhone = sessionStorage.getItem('clientPhone') || '';
    this.tableStructure = SALES_PANEL_TABLE_STRUCTURE;
    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
    let getFilter = '';
    if (event.filters && event.filters.name && !!event.filters.name[0].value) {
      getFilter = event.filters.name[0].value;
    }
    const params = { page: event.page, size: event.rows, filter: getFilter };
    this.getProductsFromOrderPageableData(params);
  }

  messageCreatedSale(submittedData: ICreateDocument) {
    const createDocumentObservable = this.documentService.createOnlineSale(submittedData);

    forkJoin([createDocumentObservable]).subscribe({
      next: () => {
        this.finalizeCompletedSale(submittedData);
      },
      error: () => {
        this.finalizeCompletedSale(submittedData);
      }
    });
  }

  private finalizeCompletedSale(submittedData: ICreateDocument) {
    sessionStorage.removeItem('formData');
    this.messageService.add({
      severity: 'success',
      summary: '¡Gracias por tu compra en Rekids!',
      detail: `Pedido confirmado para ${submittedData.clientName || 'Cliente'} (${submittedData.clientPhone || ''}) con pago QR.`
    });
    sessionStorage.removeItem('clientName');
    sessionStorage.removeItem('clientPhone');
    this.clientName = '';
    this.clientPhone = '';
    sessionStorage.removeItem('productDetail');
    this.totalPrice = 0;
    this.totalSavings = 0;
    this.getProductsFromOrderPageableData();
  }
}
