import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { IStoreEvent } from 'src/app/model/event/event';
import { IRekidsGarment } from 'src/app/model/product/product';

export interface IRegionOption {
  code: 'SANTA_CRUZ' | 'LA_PAZ';
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
      name: 'Santa Cruz',
      city: 'Santa Cruz de la Sierra',
      address: 'Envíos rápidos en todo Santa Cruz • Equipetrol Norte',
      icon: 'pi pi-sun',
      badge: 'Envío Hoy'
    },
    {
      code: 'LA_PAZ',
      name: 'La Paz',
      city: 'Nuestra Señora de La Paz',
      address: 'Envíos rápidos en La Paz y Zona Sur • Calacoto',
      icon: 'pi pi-compass',
      badge: 'Envío Hoy'
    }
  ] as IRegionOption[]
};

export const REKIDS_MOCK_GARMENTS: IRekidsGarment[] = [
  // ================= SANTA CRUZ =================
  {
    id: 'garment-scz-001',
    externalId: 'EXT-SCZ-001',
    sku: 'RK-SCZ-001',
    name: 'Conjunto Algodón Osito',
    productName: 'Conjunto Algodón Osito',
    category: 'Conjuntos',
    size: '2T',
    color: 'Celeste',
    gender: 'Niño',
    brand: "Carter's",
    purchasePrice: 45,
    salePrice: 85,
    unitaryCost: 85,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 85,
    region: 'SANTA_CRUZ',
    stock: 3,
    photo: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades']
  },
  {
    id: 'garment-scz-002',
    externalId: 'EXT-SCZ-002',
    sku: 'RK-SCZ-002',
    name: 'Vestido Floral Verano',
    productName: 'Vestido Floral Verano',
    category: 'Vestidos',
    size: '4T',
    color: 'Rosa Pastel',
    gender: 'Niña',
    brand: 'Zara Kids',
    purchasePrice: 60,
    salePrice: 120,
    unitaryCost: 96,
    discountType: 'PORCENTUAL',
    discountValue: 20,
    finalPrice: 96,
    discountApprovedBy: 'ADMIN Administrator (admin@gmail.com)',
    discountApprovedDate: Date.now() - 3600000,
    region: 'SANTA_CRUZ',
    stock: 2,
    photo: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Descuentos']
  },
  {
    id: 'garment-scz-003',
    externalId: 'EXT-SCZ-003',
    sku: 'RK-SCZ-003',
    name: 'Polera Dinosaurio DinoRex',
    productName: 'Polera Dinosaurio DinoRex',
    category: 'Poleras',
    size: '6',
    color: 'Verde Olivo',
    gender: 'Niño',
    brand: 'GAP Kids',
    purchasePrice: 30,
    salePrice: 65,
    unitaryCost: 50,
    discountType: 'MONTO_FIJO',
    discountValue: 15,
    finalPrice: 50,
    discountApprovedBy: 'ADMIN Administrator (admin@gmail.com)',
    discountApprovedDate: Date.now() - 7200000,
    region: 'SANTA_CRUZ',
    stock: 5,
    photo: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    eventNames: ['Descuentos', 'Navidad']
  },
  {
    id: 'garment-scz-004',
    externalId: 'EXT-SCZ-004',
    sku: 'RK-SCZ-004',
    name: 'Short Denim Infantil',
    productName: 'Short Denim Infantil',
    category: 'Pantalones y Shorts',
    size: '5T',
    color: 'Azul Denim',
    gender: 'Unisex',
    brand: 'OshKosh',
    purchasePrice: 40,
    salePrice: 78,
    unitaryCost: 78,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 78,
    region: 'SANTA_CRUZ',
    stock: 4,
    photo: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Navidad']
  },

  // ================= LA PAZ =================
  {
    id: 'garment-lpz-001',
    externalId: 'EXT-LPZ-001',
    sku: 'RK-LPZ-001',
    name: 'Chamarra Térmica Acolchada',
    productName: 'Chamarra Térmica Acolchada',
    category: 'Abrigos y Chamarras',
    size: '6',
    color: 'Azul Marino',
    gender: 'Niño',
    brand: 'The North Face Kids',
    purchasePrice: 110,
    salePrice: 210,
    unitaryCost: 180,
    discountType: 'MONTO_FIJO',
    discountValue: 30,
    finalPrice: 180,
    discountApprovedBy: 'ADMIN Administrator (admin@gmail.com)',
    discountApprovedDate: Date.now() - 5400000,
    region: 'LA_PAZ',
    stock: 2,
    photo: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Descuentos']
  },
  {
    id: 'garment-lpz-002',
    externalId: 'EXT-LPZ-002',
    sku: 'RK-LPZ-002',
    name: 'Chompa Tejida Copos de Nieve',
    productName: 'Chompa Tejida Copos de Nieve',
    category: 'Chompas y Polerones',
    size: '4T',
    color: 'Rojo Navidad',
    gender: 'Niña',
    brand: 'H&M Kids',
    purchasePrice: 55,
    salePrice: 115,
    unitaryCost: 115,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 115,
    region: 'LA_PAZ',
    stock: 3,
    photo: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Navidad']
  },
  {
    id: 'garment-lpz-003',
    externalId: 'EXT-LPZ-003',
    sku: 'RK-LPZ-003',
    name: 'Buzo Polar Completo',
    productName: 'Buzo Polar Completo',
    category: 'Conjuntos',
    size: '3T',
    color: 'Gris Melange',
    gender: 'Unisex',
    brand: "Carter's",
    purchasePrice: 50,
    salePrice: 95,
    unitaryCost: 85.5,
    discountType: 'PORCENTUAL',
    discountValue: 10,
    finalPrice: 85.5,
    discountApprovedBy: 'ADMIN Administrator (admin@gmail.com)',
    discountApprovedDate: Date.now() - 1800000,
    region: 'LA_PAZ',
    stock: 4,
    photo: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Descuentos']
  },
  {
    id: 'garment-lpz-004',
    externalId: 'EXT-LPZ-004',
    sku: 'RK-LPZ-004',
    name: 'Botines Impermeables Kids',
    productName: 'Botines Impermeables Kids',
    category: 'Calzado',
    size: '28',
    color: 'Café',
    gender: 'Unisex',
    brand: 'Colloky',
    purchasePrice: 75,
    salePrice: 145,
    unitaryCost: 145,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 145,
    region: 'LA_PAZ',
    stock: 2,
    photo: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    eventNames: ['Navidad']
  }
];

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
