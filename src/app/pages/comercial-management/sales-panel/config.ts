import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { IStoreEvent } from 'src/app/model/event/event';
import { IRekidsGarment } from 'src/app/model/product/product';

export interface IRegionOption {
  code: 'SANTA_CRUZ' | 'LA_PAZ';
  branchId: string;
  name: string;
  city: string;
  address: string;
  icon: string;
  badge: string;
}

export const REKIDS_SALES_CONFIG = {
  storeName: 'Rekids',
  storeTagline: 'Moda Infantil Online • Compra Rápida y Segura',
  defaultChannel: 'ONLINE',
  defaultPaymentMethod: 'QR',
  defaultFallbackImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
  regions: [
    {
      code: 'SANTA_CRUZ',
      branchId: '10000000-0000-4000-8000-000000000002',
      name: 'Santa Cruz',
      city: 'Santa Cruz de la Sierra',
      address: 'Santa Cruz de la Sierra, Bolivia',
      icon: 'pi pi-sun',
      badge: 'Tienda Online'
    },
    {
      code: 'LA_PAZ',
      branchId: '10000000-0000-4000-8000-000000000001',
      name: 'La Paz',
      city: 'Nuestra Señora de La Paz',
      address: 'La Paz, Bolivia',
      icon: 'pi pi-compass',
      badge: 'Tienda Online'
    }
  ] as IRegionOption[]
};

export const REKIDS_MOCK_GARMENTS: IRekidsGarment[] = [];

export const REKIDS_MOCK_EVENTS: IStoreEvent[] = [
  {
    id: 'evt-novedades',
    name: 'Novedades',
    code: 'NOVEDADES',
    description: 'Todas las prendas nuevas recién ingresadas en Rekids',
    isDefault: true,
    discountType: 'NONE',
    discountValue: 0,
    state: 'ACTIVE',
    products: []
  },
  {
    id: 'evt-descuentos',
    name: 'Descuentos',
    code: 'DESCUENTOS',
    description: 'Prendas con descuento especial aprobado',
    isDefault: true,
    discountType: 'PORCENTUAL',
    discountValue: 15,
    approvedByAdminName: 'ADMIN Administrator (admin@gmail.com)',
    approvedDate: Date.now() - 3600000,
    state: 'ACTIVE',
    products: []
  },
  {
    id: 'evt-navidad',
    name: 'Navidad',
    code: 'NAVIDAD',
    description: 'Colección especial de prendas seleccionadas para Navidad',
    isDefault: false,
    discountType: 'NONE',
    discountValue: 0,
    approvedByAdminName: 'ADMIN Administrator (admin@gmail.com)',
    approvedDate: Date.now() - 7200000,
    state: 'ACTIVE',
    products: []
  }
];

export const SALES_PANEL_TABLE_STRUCTURE: ColumnStructure[] = [
  { thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false },
  { thead: 'idProduct', value: 'idProduct', ttype: 'text', visible: false, hasFilter: false, filterplaceholder: 'Buscar por id' },
  { thead: 'Prenda', value: 'productName', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por nombre' },
  { thead: 'Detalle', value: 'sku', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Detalle' },
  { thead: 'Precio (BOB)', value: 'unitaryCost', ttype: 'number', visible: true, hasFilter: false, filterplaceholder: 'Precio' },
  { thead: 'Cantidad', value: 'quantity', ttype: 'number', visible: true, hasFilter: false, isEditable: true, filterplaceholder: 'Cantidad' },
  { thead: 'Ahorro (BOB)', value: 'totalDiscount', ttype: 'decimal', visible: true, hasFilter: false, isEditable: false, filterplaceholder: 'Ahorro' },
  { thead: 'Subtotal (BOB)', value: 'totalPrice', ttype: 'decimal', visible: true, hasFilter: false, filterplaceholder: 'Subtotal' },
  { thead: 'Stock', value: 'stock', ttype: 'number', visible: false, hasFilter: false, filterplaceholder: 'Stock' }
];
