import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProductService } from 'src/app/services/product/product.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { DomainService } from 'src/app/services/domain/domain.service';
import * as Notiflix from 'notiflix';

@Component({
  selector: 'app-agile-add-product',
  templateUrl: './agile-add-product.component.html',
  styleUrls: ['./agile-add-product.component.scss'],
  providers: [MessageService]
})
export class AgileAddProductComponent implements OnInit {

  products: any[] = [];
  categories: any[] = [];

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  isLoading: boolean = false;
  hasMore: boolean = true;

  // Filters
  selectedCategory: string = '';
  selectedCategoryObj: any = null;
  searchQuery: string = '';
  displayAddCategory: boolean = false;
  newCategory = { name: '', description: '' };

  constructor(
    private productService: ProductService,
    private domainService: DomainService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts(true);
  }

  loadCategories() {
    this.domainService.getDomainValues('CATEGORIAS_PRODUCTOS').subscribe({
      next: (res) => {
        let fetchedCats = res.data || [];
        this.categories = [{ name: 'Todas', id: '' }, ...fetchedCats];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las categorías.' });
        this.categories = [{ name: 'Todas', id: '' }];
      }
    });
  }

  loadProducts(reset: boolean = false) {
    if (reset) {
      this.currentPage = 0;
      this.products = [];
      this.hasMore = true;
    }

    if (!this.hasMore || this.isLoading) return;

    this.isLoading = true;

    const params = {
      page: this.currentPage,
      size: this.pageSize,
      category: this.selectedCategory,
      filter: this.searchQuery
    };

    this.productService.getProductWithImagePageable(params).subscribe({
      next: (res) => {
        const fetchedProducts = res.data.content || res.data;
        this.products = [...this.products, ...fetchedProducts];
        this.totalElements = res.data.page?.totalElements || this.products.length;
        this.hasMore = fetchedProducts.length === this.pageSize && this.products.length < this.totalElements;
        this.currentPage++;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos.' });
      }
    });
  }

  loadMore() {
    this.loadProducts(false);
  }

  onCategorySelect(cat: any) {
    this.selectedCategoryObj = cat;
    this.selectedCategory = cat.name === 'Todas' ? '' : cat.name;
    this.loadProducts(true);
  }

  showAddCategoryDialog() {
    this.newCategory = { name: '', description: '' };
    this.displayAddCategory = true;
  }

  createCategory() {
    if (!this.newCategory.name) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El nombre es obligatorio' });
      return;
    }
    const createReq = {
      domain: 'CATEGORIAS_PRODUCTOS',
      name: this.newCategory.name,
      description: this.newCategory.description
    };
    this.domainService.createDomainValue(createReq).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada' });
        this.displayAddCategory = false;
        this.loadCategories();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear la categoría' });
      }
    });
  }

  deleteSelectedCategory() {
    if (!this.selectedCategoryObj || !this.selectedCategoryObj.id) return;

    this.domainService.checkDomainValueUsage(this.selectedCategoryObj.id).subscribe({
      next: (res) => {
        const usageCount = res.data || 0;
        if (usageCount > 0) {
          Notiflix.Confirm.show(
            'Confirmación',
            `Actualmente cuentas con ${usageCount} registros de productos asignados a esta categoria.... Confirma la eliminacion?`,
            'Sí', 'No',
            () => this.performDeleteCategory(this.selectedCategoryObj.id),
            () => { }
          );
        } else {
          this.performDeleteCategory(this.selectedCategoryObj.id);
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo verificar el uso de la categoría' });
      }
    });
  }

  private performDeleteCategory(idDomain: string) {
    this.domainService.deleteDomainValue(idDomain).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría eliminada' });
        this.selectedCategoryObj = null;
        this.selectedCategory = '';
        this.loadCategories();
        this.loadProducts(true);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la categoría' });
      }
    });
  }

  onSearch() {
    this.loadProducts(true);
  }

  getSafeImage(base64: string): string {
    if (base64 && !base64.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64}`;
    }
    return base64 || 'assets/layout/images/product-placeholder.png'; // Make sure you have a default local image or path
  }

  selectProduct(product: any) {
    let rawStr = sessionStorage.getItem('productDetail');
    let detailObj = rawStr ? JSON.parse(rawStr) : { content: [], page: { totalElements: 0, size: 10 } };

    // Check if product is already added
    let existingIndex = detailObj.content.findIndex((p: any) => p.idProduct === product.id);

    // Fallback unitary cost logic since image API may not return it. Assume 10 if not present.
    // In a real scenario, this would come from a Pricing endpoint or Product property
    const defaultPrice = product.unitaryCost || 10;

    if (existingIndex !== -1) {
      if (detailObj.content[existingIndex].quantity >= (product.stock)) {
        this.messageService.add({ severity: 'warn', summary: 'Stock Agotado', detail: `Solo hay ${product.stock} unidades de ${product.name} en almacén.` });
        return;
      }
      detailObj.content[existingIndex].quantity += 1;
      detailObj.content[existingIndex].totalPrice = detailObj.content[existingIndex].quantity * detailObj.content[existingIndex].unitaryCost - detailObj.content[existingIndex].totalDiscount;
      this.messageService.add({ severity: 'info', summary: 'Cantidad Actualizada', detail: `${product.name} (x${detailObj.content[existingIndex].quantity})` });
    } else {
      detailObj.content.push({
        idProduct: product.id,
        productName: product.name,
        sku: product.sku || 'SKU-0',
        unitaryCost: defaultPrice,
        quantity: 1,
        totalDiscount: 0,
        totalPrice: defaultPrice,
        stock: product.stock || 100 // fallback stock
      });
      this.messageService.add({ severity: 'success', summary: 'Producto Seleccionado', detail: product.name });
    }

    detailObj.page.totalElements = detailObj.content.length;
    sessionStorage.setItem('productDetail', JSON.stringify(detailObj));
  }

  acceptAndReturn() {
    this.router.navigate(['/dashboard/comercial-management/sales-panel']);
  }

  getLoadedPercent(): number {
    if (this.totalElements === 0) return 0;
    return Math.round((this.products.length / this.totalElements) * 100);
  }

  isProductSelected(product: any): boolean {
    let rawStr = sessionStorage.getItem('productDetail');
    if (!rawStr) return false;
    let detailObj = JSON.parse(rawStr);
    return detailObj.content.some((p: any) => p.idProduct === product.id);
  }

  getProductQty(product: any): number {
    let rawStr = sessionStorage.getItem('productDetail');
    if (!rawStr) return 0;
    let detailObj = JSON.parse(rawStr);
    let found = detailObj.content.find((p: any) => p.idProduct === product.id);
    return found ? found.quantity : 0;
  }

}
