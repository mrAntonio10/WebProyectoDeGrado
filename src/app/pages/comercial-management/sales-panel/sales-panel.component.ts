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
import { RekidsBranchCatalogModel, RekidsProductModel } from 'src/app/model/rekids/rekids.model';
import { REKIDS_BRANCH_UUIDS } from 'src/app/model/rekids/rekids.dto';
import { RekidsCatalogViewModel } from 'src/app/viewmodels/rekids-catalog.viewmodel';
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
  branchCatalogs: RekidsBranchCatalogModel[] = [];
  onlyAvailableFilter: boolean = false;
  events: IStoreEvent[] = [];
  selectedEventCode: string = 'TODOS';
  isLoggedInAdmin: boolean = false;

  // Paginación y filtros adaptados a ReKids API Sandbox v1
  catalogPage: number = 0;
  catalogPageSize: number = 6;
  catalogTotalElements: number = 0;
  catalogTotalPages: number = 1;
  isLoadingCatalog: boolean = false;
  branchNextCursor: string | null = null;
  branchCursorHistory: (string | null)[] = [];

  selectedCategoryFilter: string = '';
  selectedSizeFilter: string = '';
  selectedBrandFilter: string = '';
  selectedConditionFilter: string = '';
  selectedAvailabilityFilter: string = '';

  categoryOptions: { label: string; value: string }[] = [
    { label: 'Todas las Categorías', value: '' },
    { label: 'Vestidos', value: 'Vestidos' },
    { label: 'Poleras', value: 'Poleras' },
    { label: 'Conjuntos', value: 'Conjuntos' },
    { label: 'Pantalones y Shorts', value: 'Pantalones' },
    { label: 'Abrigos y Chamarras', value: 'Abrigos' },
    { label: 'Chompas y Polerones', value: 'Chompas' },
    { label: 'Zapatos / Calzado', value: 'Zapatos' }
  ];

  sizeOptions: { label: string; value: string }[] = [
    { label: 'Todas las Tallas', value: '' },
    { label: 'Talla 2T', value: '2T' },
    { label: 'Talla 3T', value: '3T' },
    { label: 'Talla 4 / 4T', value: '4' },
    { label: 'Talla 5T', value: '5T' },
    { label: 'Talla 6', value: '6' },
    { label: 'Talla 8', value: '8' },
    { label: 'Calzado 28', value: '28' }
  ];

  conditionOptions: { label: string; value: string }[] = [
    { label: 'Todos los Estados', value: '' },
    { label: 'Excelente', value: 'Excelente' },
    { label: 'Bueno', value: 'Bueno' }
  ];

  availabilityOptions: { label: string; value: string }[] = [
    { label: 'Todas (Disponibles y Vendidas)', value: '' },
    { label: 'Solo Disponibles (available)', value: 'available' },
    { label: 'Vendidas / Reservadas (unavailable)', value: 'unavailable' }
  ];

  // Modal de ficha oficial individual (/integrations/v1/products/{product_id})
  displayProductDetailDialog: boolean = false;
  selectedProductDetail: RekidsProductModel | null = null;
  selectedGarmentForDetail: IRekidsGarment | null = null;

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
    public rekidsCatalogVM: RekidsCatalogViewModel,
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
    this.selectedCategoryFilter = '';
    this.selectedSizeFilter = '';
    this.selectedBrandFilter = '';
    this.selectedConditionFilter = '';
    this.selectedAvailabilityFilter = '';
    this.onlyAvailableFilter = false;
    this.catalogPage = 0;
    this.branchNextCursor = null;
    this.branchCursorHistory = [];
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

  getActiveBranchUuid(regionCode: string = this.selectedRegion): string {
    return regionCode === 'LA_PAZ' ? REKIDS_BRANCH_UUIDS.LA_PAZ : REKIDS_BRANCH_UUIDS.SANTA_CRUZ;
  }

  loadRegionEventsAndGarments(regionCode: string) {
    this.rekidsCatalogVM.selectBranch(regionCode);
    const branchId = this.getActiveBranchUuid(regionCode);

    // Cargar página de sucursal desde endpoint ReKids Sandbox con límite paginado
    this.rekidsCatalogVM
      .loadBranchProductsPaginated(branchId, {
        limit: this.catalogPageSize,
        page: 0
      })
      .subscribe({
        next: (pageDto) => {
          this.branchNextCursor = pageDto?.next_cursor ?? null;
        }
      });

    this.rekidsCatalogVM.loadCatalogSeparatedByBranches(regionCode).subscribe({
      next: (catalogs) => {
        this.branchCatalogs = catalogs;
      }
    });

    this.storeEventService.getPublicEvents(regionCode).subscribe({
      next: (res) => {
        const apiEvents = res?.data || [];
        this.events = apiEvents.length > 0 ? apiEvents : this.getMockEventsFromStorageOrConfig();
      },
      error: () => {
        this.events = this.getMockEventsFromStorageOrConfig();
      }
    });

    // Cargar lote base de la región para contadores y fallback local
    this.regionGarments = this.getMockGarmentsForRegion(regionCode);
    this.loadPaginatedCatalogForRegion(0);
  }

  /**
   * Consulta paginada real contra el backend enviando page, size y todos los filtros activos
   */
  loadPaginatedCatalogForRegion(pageIndex: number = this.catalogPage) {
    if (!this.selectedRegion) return;
    this.catalogPage = Math.max(0, pageIndex);
    this.isLoadingCatalog = true;

    const availabilityParam = this.onlyAvailableFilter
      ? 'available'
      : this.selectedAvailabilityFilter || '';

    const queryParams: any = {
      page: this.catalogPage,
      size: this.catalogPageSize,
      eventId: this.selectedEventCode !== 'TODOS' ? this.selectedEventCode : '',
      category: this.selectedCategoryFilter || '',
      clothingSize: this.selectedSizeFilter || '',
      brand: this.selectedBrandFilter || '',
      condition: this.selectedConditionFilter || '',
      availability: availabilityParam,
      filter: (this.searchText || '').trim()
    };

    this.productService.getProductsByRegion(this.selectedRegion, queryParams).subscribe({
      next: (res) => {
        this.isLoadingCatalog = false;
        const pagedData = res?.data;
        const apiGarments: any[] = pagedData?.content || (Array.isArray(pagedData) ? pagedData : []);
        const pageMeta = pagedData?.page;

        if (apiGarments.length > 0 || (pageMeta && pageMeta.totalElements === 0)) {
          this.filteredGarments = apiGarments.map((g: any) => this.enrichGarmentImage(g));
          this.catalogTotalElements =
            pageMeta?.totalElements !== undefined ? Number(pageMeta.totalElements) : this.filteredGarments.length;
          this.catalogTotalPages =
            pageMeta?.totalPages !== undefined
              ? Math.max(1, Number(pageMeta.totalPages))
              : Math.max(1, Math.ceil(this.catalogTotalElements / this.catalogPageSize));
          if (this.catalogPage === 0 && !this.hasActiveCatalogFilters()) {
            this.regionGarments = [...this.filteredGarments];
          }
        } else {
          this.applyClientFallbackPagination();
        }
      },
      error: () => {
        this.isLoadingCatalog = false;
        this.applyClientFallbackPagination();
      }
    });
  }

  hasActiveCatalogFilters(): boolean {
    return (
      (this.selectedEventCode && this.selectedEventCode !== 'TODOS') ||
      !!this.selectedCategoryFilter ||
      !!this.selectedSizeFilter ||
      !!this.selectedBrandFilter ||
      !!this.selectedConditionFilter ||
      !!this.selectedAvailabilityFilter ||
      this.onlyAvailableFilter ||
      !!(this.searchText && this.searchText.trim())
    );
  }

  clearAllCatalogFilters() {
    this.selectedEventCode = 'TODOS';
    this.selectedCategoryFilter = '';
    this.selectedSizeFilter = '';
    this.selectedBrandFilter = '';
    this.selectedConditionFilter = '';
    this.selectedAvailabilityFilter = '';
    this.onlyAvailableFilter = false;
    this.searchText = '';
    this.loadPaginatedCatalogForRegion(0);
  }

  onCatalogPageChange(event: any) {
    const newPage = event.page !== undefined ? Number(event.page) : Math.floor(Number(event.first || 0) / Number(event.rows || this.catalogPageSize));
    const newSize = Number(event.rows || this.catalogPageSize);
    this.catalogPageSize = newSize;
    this.loadPaginatedCatalogForRegion(newPage);
  }

  /**
   * Consulta la ficha comercial individual desde GET /integrations/v1/products/{product_id}
   */
  openOfficialProductSheet(garment: IRekidsGarment) {
    this.selectedGarmentForDetail = garment;
    const targetId = garment.externalId || garment.id;
    this.rekidsCatalogVM.fetchProductById(targetId).subscribe({
      next: (model) => {
        if (model) {
          this.selectedProductDetail = model;
        } else {
          this.selectedProductDetail = new RekidsProductModel(
            {
              id: garment.externalId || garment.id,
              code: garment.sku,
              legacy_code: garment.legacyCode ?? null,
              branch_id: garment.branchId || this.getActiveBranchUuid(),
              name: garment.name,
              category: garment.category,
              size: garment.size || null,
              brand: garment.brand || null,
              condition: garment.condition || 'Excelente',
              price: Number(garment.finalPrice || garment.salePrice || 0).toFixed(2),
              currency: 'BOB',
              availability: this.isGarmentAvailable(garment) ? 'available' : 'unavailable',
              photos: garment.photos || [],
              updated_at: garment.updatedAt || new Date().toISOString(),
              version: garment.version || 1
            },
            garment.branchName,
            garment.region
          );
        }
        this.displayProductDetailDialog = true;
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
    this.loadPaginatedCatalogForRegion(0);
  }

  applyFilters() {
    this.loadPaginatedCatalogForRegion(0);
  }

  onAvailabilityFilterChange() {
    this.onlyAvailableFilter = this.selectedAvailabilityFilter === 'available';
    this.loadPaginatedCatalogForRegion(0);
  }

  private applyClientFallbackPagination() {
    const eventCode = this.selectedEventCode;
    const baseList = this.getMockGarmentsForRegion(this.selectedRegion);
    this.regionGarments = [...baseList];
    let list = [...baseList];

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

    if (this.selectedCategoryFilter) {
      const cat = this.selectedCategoryFilter.toLowerCase();
      list = list.filter(g => (g.category || '').toLowerCase().includes(cat));
    }

    if (this.selectedSizeFilter) {
      const sz = this.selectedSizeFilter.toLowerCase();
      list = list.filter(g => (g.size || '').toLowerCase().includes(sz));
    }

    if (this.selectedBrandFilter) {
      const br = this.selectedBrandFilter.toLowerCase();
      list = list.filter(g => (g.brand || '').toLowerCase().includes(br));
    }

    if (this.selectedConditionFilter) {
      const cond = this.selectedConditionFilter.toLowerCase();
      list = list.filter(
        g =>
          (g.condition || '').toLowerCase().includes(cond) ||
          (g.color || '').toLowerCase().includes(cond)
      );
    }

    const effectiveAvail = this.onlyAvailableFilter ? 'available' : this.selectedAvailabilityFilter;
    if (effectiveAvail === 'available') {
      list = list.filter(g => this.isGarmentAvailable(g));
    } else if (effectiveAvail === 'unavailable') {
      list = list.filter(g => !this.isGarmentAvailable(g));
    }

    if (this.searchText && this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(
        g =>
          (g.name || '').toLowerCase().includes(q) ||
          (g.sku || '').toLowerCase().includes(q) ||
          (g.legacyCode || '').toLowerCase().includes(q) ||
          (g.condition || '').toLowerCase().includes(q) ||
          (g.brand || '').toLowerCase().includes(q) ||
          (g.size || '').toLowerCase().includes(q) ||
          (g.color || '').toLowerCase().includes(q) ||
          (g.category || '').toLowerCase().includes(q)
      );
    }

    this.catalogTotalElements = list.length;
    this.catalogTotalPages = Math.max(1, Math.ceil(list.length / this.catalogPageSize));
    if (this.catalogPage >= this.catalogTotalPages) {
      this.catalogPage = 0;
    }
    const start = this.catalogPage * this.catalogPageSize;
    this.filteredGarments = list.slice(start, start + this.catalogPageSize);
  }

  isGarmentAvailable(garment: IRekidsGarment): boolean {
    if (!garment) return false;
    if (garment.availability === 'unavailable') return false;
    if (garment.stock !== undefined && garment.stock !== null && Number(garment.stock) <= 0) return false;
    return true;
  }

  toggleOnlyAvailableFilter() {
    this.onlyAvailableFilter = !this.onlyAvailableFilter;
    this.selectedAvailabilityFilter = this.onlyAvailableFilter ? 'available' : '';
    this.loadPaginatedCatalogForRegion(0);
  }

  getActiveBranchCatalog(): RekidsBranchCatalogModel | null {
    if (!this.selectedRegion || !this.branchCatalogs) return null;
    return this.branchCatalogs.find(c => c.branch.region === this.selectedRegion) || null;
  }

  getAvailableRegionGarmentsCount(): number {
    return this.regionGarments.filter(g => this.isGarmentAvailable(g)).length;
  }

  getUnavailableRegionGarmentsCount(): number {
    return this.regionGarments.filter(g => !this.isGarmentAvailable(g)).length;
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

    if (!this.isGarmentAvailable(garment)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Prenda No Disponible',
        detail: `La prenda "${garment.name}" (${garment.sku}) figura como no disponible (vendida o reservada).`
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
    const maxStock = garment.stock !== undefined && garment.stock !== null ? Number(garment.stock) : 1;
    if (maxStock <= 0 || garment.availability === 'unavailable') {
      return;
    }

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

  goToAboutUs() {
    this.router.navigate(['/dashboard/comercial-management/about-us']);
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
